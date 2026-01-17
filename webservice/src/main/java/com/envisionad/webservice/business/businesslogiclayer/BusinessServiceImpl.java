package com.envisionad.webservice.business.businesslogiclayer;

import com.envisionad.webservice.business.dataaccesslayer.*;
import com.envisionad.webservice.business.exceptions.*;
import com.envisionad.webservice.business.mappinglayer.BusinessMapper;
import com.envisionad.webservice.business.mappinglayer.EmployeeMapper;
import com.envisionad.webservice.business.mappinglayer.InvitationMapper;
import com.envisionad.webservice.business.mappinglayer.VerificationMapper;
import com.envisionad.webservice.business.presentationlayer.models.*;
import com.envisionad.webservice.business.utils.Validator;
import com.envisionad.webservice.utils.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
public class BusinessServiceImpl implements BusinessService {

    private final EmailService emailService;

    private final BusinessRepository businessRepository;

    private final InvitationRepository invitationRepository;

    private final EmployeeRepository employeeRepository;

    private final VerificationRepository verificationRepository;

    private final BusinessMapper businessMapper;

    private final EmployeeMapper employeeMapper;

    private final InvitationMapper invitationMapper;

    private final VerificationMapper verificationMapper;

    public BusinessServiceImpl(EmailService emailService, BusinessRepository businessRepository, InvitationRepository invitationRepository, EmployeeRepository employeeRepository, VerificationRepository verificationRepository, BusinessMapper businessMapper, EmployeeMapper employeeMapper, InvitationMapper invitationMapper, VerificationMapper verificationMapper) {
        this.emailService = emailService;
        this.businessRepository = businessRepository;
        this.invitationRepository = invitationRepository;
        this.employeeRepository = employeeRepository;
        this.verificationRepository = verificationRepository;
        this.businessMapper = businessMapper;
        this.employeeMapper = employeeMapper;
        this.invitationMapper = invitationMapper;
        this.verificationMapper = verificationMapper;
    }

    @Override
    public BusinessResponseModel createBusiness(Jwt jwt, BusinessRequestModel businessRequestModel) {
        Validator.validateBusiness(businessRequestModel);

        if (businessRepository.existsByName(businessRequestModel.getName()))
            throw new DuplicateBusinessNameException();

        String userId = extractUserId(jwt);
        if(employeeRepository.existsByUserId(userId))
            throw new AccessDeniedException("Access denied");

        Business business = businessMapper.toEntity(businessRequestModel);
        business.setBusinessId(new BusinessIdentifier());
        business.setOwnerId(userId);

        Employee employee = new Employee();
        employee.setBusinessId(business.getBusinessId());
        employee.setEmployeeId(new EmployeeIdentifier());
        employee.setUserId(userId);

        businessRepository.save(business);
        employeeRepository.save(employee);

        return businessMapper.toResponse(business);
    }

    @Override
    public List<BusinessResponseModel> getAllBusinesses() {
        return businessRepository.findAll().stream().map(businessMapper::toResponse).toList();
    }

    @Override
    public BusinessResponseModel getBusinessById(String businessId) {
        Business business = businessRepository.findByBusinessId_BusinessId(businessId);
        if (business == null)
            throw new BusinessNotFoundException();

        return businessMapper.toResponse(business);
    }

    @Override
    public BusinessResponseModel updateBusinessById(Jwt jwt, String businessId, BusinessRequestModel businessRequestModel) {
        Validator.validateBusiness(businessRequestModel);

        Business existingBusiness = businessRepository.findByBusinessId_BusinessId(businessId);
        if (existingBusiness == null)
            throw new BusinessNotFoundException();

        if (businessRepository.existsByName(businessRequestModel.getName()))
            throw new DuplicateBusinessNameException();

        String userId = extractUserId(jwt);
        validateUserIsEmployeeOfBusiness(userId, businessId);

        Business newBusiness = businessMapper.toEntity(businessRequestModel);
        newBusiness.setId(existingBusiness.getId());
        newBusiness.setBusinessId(existingBusiness.getBusinessId());
        newBusiness.setOwnerId(existingBusiness.getOwnerId());

        return businessMapper.toResponse(businessRepository.save(newBusiness));
    }

    @Override
    public VerificationResponseModel approveBusinessVerification(String businessId, String verificationId){
        VerificationContext context = updateBusinessVerification(businessId, verificationId);

        context.verification.setStatus(VerificationStatus.APPROVED);
        context.business.setVerified(true);

        businessRepository.save(context.business);
        return verificationMapper.toResponse(verificationRepository.save(context.verification));
    }

    @Override
    public VerificationResponseModel denyBusinessVerification(String businessId, String verificationId, String reason) {
        if (reason == null || reason.isEmpty() || reason.length() > 512)
            throw new BadVerificationRequestException();

        Verification verification = updateBusinessVerification(businessId, verificationId).verification;

        verification.setStatus(VerificationStatus.DENIED);
        verification.setComments(reason);

        return verificationMapper.toResponse(verificationRepository.save(verification));
    }

    @Override
    public VerificationResponseModel requestVerification(Jwt jwt, String businessId) {
        Business business = businessRepository.findByBusinessId_BusinessId(businessId);
        if (business == null)
            throw new BusinessNotFoundException();

        String userId = extractUserId(jwt);
        validateUserIsEmployeeOfBusiness(userId, businessId);

        if (business.isVerified())
            throw new BusinessAlreadyVerifiedException();

        if (verificationRepository.findAllByBusinessId_BusinessId(businessId).stream().anyMatch(v -> v.getStatus() == VerificationStatus.PENDING))
            throw new BadVerificationRequestException();

        Verification verification = new Verification();
        verification.setVerificationId(new VerificationIdentifier());
        verification.setBusinessId(new BusinessIdentifier(businessId));

        return verificationMapper.toResponse(verificationRepository.save(verification));
    }

    @Override
    public List<VerificationResponseModel> getAllVerificationsByBusinessId(Jwt jwt, String businessId) {
        String userId = extractUserId(jwt);
        validateUserIsEmployeeOfBusiness(userId, businessId);

        return verificationRepository.findAllByBusinessId_BusinessId(businessId).stream().map(verificationMapper::toResponse).toList();
    }

    @Override
    public List<VerificationResponseModel> getAllVerificationRequests() {
        return verificationRepository.findAllByStatus(VerificationStatus.PENDING).stream().map(verificationMapper::toResponse).toList();
    }

    @Override
    public InvitationResponseModel createInvitation(Jwt jwt, String businessId, InvitationRequestModel invitationRequest) {
        Business business = businessRepository.findByBusinessId_BusinessId(businessId);
        if (business == null)
            throw new BusinessNotFoundException();

        String userId = extractUserId(jwt);
        validateUserIsEmployeeOfBusiness(userId, businessId);

        Invitation invitation =  invitationMapper.toEntity(invitationRequest);

        if (invitationRepository.existsByBusinessId_BusinessIdAndEmail(businessId, invitation.getEmail()))
            throw new BadInvitationRequestException();

        String token = UUID.randomUUID().toString();
        invitation.setToken(token);
        invitation.setInvitationId(new InvitationIdentifier());
        invitation.setBusinessId(new BusinessIdentifier(businessId));
        invitation.setTimeExpires(LocalDateTime.now().plusHours(1));

        String link = "http://localhost:3000/invite?businessId=" + businessId + "&token=" + token;
        emailService.sendSimpleEmail(invitation.getEmail(), "Invitation to join " + business.getName() + " on Envision Ad", "Click on this link to join " + business.getName() + "\n" + link);

        return invitationMapper.toResponse(invitationRepository.save(invitation));
    }

    @Override
    public void cancelInvitation(Jwt jwt, String businessId, String invitationId) {
        if (!businessRepository.existsByBusinessId_BusinessId(businessId))
            throw new BusinessNotFoundException();

        String userId = extractUserId(jwt);
        validateUserIsEmployeeOfBusiness(userId, businessId);

        Invitation invitation = invitationRepository.findByInvitationId_InvitationId(invitationId);

        if (invitation == null)
            throw new InvitationNotFoundException();

        invitationRepository.delete(invitation);
    }

    @Override
    public List<EmployeeResponseModel> getAllEmployeesByBusinessId(Jwt jwt, String businessId) {
        if (!businessRepository.existsByBusinessId_BusinessId(businessId))
            throw new BusinessNotFoundException();

        String userId = extractUserId(jwt);
        validateUserIsEmployeeOfBusiness(userId, businessId);

        return employeeRepository.findAllByBusinessId_BusinessId(businessId)
                .stream()
                .map(employeeMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<InvitationResponseModel> getAllInvitationsByBusinessId(Jwt jwt, String businessId) {
        if (!businessRepository.existsByBusinessId_BusinessId(businessId))
            throw new BusinessNotFoundException();

        String userId = extractUserId(jwt);
        validateUserIsEmployeeOfBusiness(userId, businessId);

        return invitationRepository.findAllByBusinessId_BusinessId(businessId).stream().map(invitationMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public EmployeeResponseModel addBusinessEmployee(Jwt jwt, String businessId, String token) {
        if (!businessRepository.existsByBusinessId_BusinessId(businessId))
            throw new BusinessNotFoundException();

        Invitation invitation = invitationRepository.findByToken(token);
        if (invitation == null)
            throw new InvitationNotFoundException();

        invitationRepository.delete(invitation);

        if (invitation.getTimeExpires().isBefore(LocalDateTime.now()))
            throw new InvitationNotFoundException();

        String userId = extractUserId(jwt);
        if (employeeRepository.existsByUserIdAndBusinessId_BusinessId(userId, businessId))
            throw new AccessDeniedException("User is already an employee");

        Employee employee = new Employee();
        employee.setBusinessId(new BusinessIdentifier(businessId));
        employee.setEmployeeId(new EmployeeIdentifier());
        employee.setUserId(userId);

        return employeeMapper.toResponse(employeeRepository.save(employee));
    }

    @Override
    public void removeBusinessEmployeeById(Jwt jwt, String businessId, String employeeId) {
        Business business = businessRepository.findByBusinessId_BusinessId(businessId);
        if (business.getOwnerId().equals(employeeId))
            throw new BadBusinessRequestException();

        String userId = extractUserId(jwt);
        validateUserIsEmployeeOfBusiness(userId, businessId);

        if (!businessRepository.existsByBusinessId_BusinessId(businessId))
            throw new BusinessNotFoundException();

        List<Employee> employees = employeeRepository.findAllByBusinessId_BusinessId(businessId);
        Employee employee = employees.stream().filter(e -> e.getEmployeeId().getEmployeeId().equals(employeeId)).findFirst().orElse(null);

        if (employee == null)
            throw new BusinessEmployeeNotFoundException();

        employeeRepository.delete(employee);
    }

    @Override
    public BusinessResponseModel getBusinessByUserId(Jwt jwt, String userId) {
        String authenticatedUserId = extractUserId(jwt);
        if (!userId.equals(authenticatedUserId))
            throw new AccessDeniedException("Access Denied");

        Employee employee = employeeRepository.findByUserId(userId);
        if (employee == null)
            throw new BusinessEmployeeNotFoundException();

        Business business = businessRepository.findByBusinessId_BusinessId(employee.getBusinessId().getBusinessId());
        if (business == null)
            throw new BusinessNotFoundException();

        return businessMapper.toResponse(business);
    }

    private String extractUserId(Jwt jwt) {
        String userId = jwt.getClaim("sub");
        if (userId == null || userId.isEmpty())
            throw new AccessDeniedException("Invalid token");
        return userId;
    }

    private void validateUserIsEmployeeOfBusiness(String userId, String businessId) {
        if (!employeeRepository.existsByUserIdAndBusinessId_BusinessId(userId, businessId))
            throw new AccessDeniedException("Access Denied");
    }

    private VerificationContext updateBusinessVerification(String businessId, String verificationId){
        Verification verification = verificationRepository.findVerificationByVerificationId_VerificationId(verificationId);
        if (verification == null)
            throw new VerificationNotFoundException();

        if (verification.getStatus() != VerificationStatus.PENDING)
            throw new BadVerificationRequestException();

        Business business = businessRepository.findByBusinessId_BusinessId(businessId);
        if (business == null)
            throw new BusinessNotFoundException();

        if (business.isVerified())
            throw new BusinessAlreadyVerifiedException();

        return new VerificationContext(verification, business);
    }

    private record VerificationContext(Verification verification, Business business) {}
}
