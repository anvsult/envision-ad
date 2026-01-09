package com.envisionad.webservice.business.businesslogiclayer;

import com.envisionad.webservice.business.dataaccesslayer.*;
import com.envisionad.webservice.business.exceptions.BusinessEmployeeNotFoundException;
import com.envisionad.webservice.business.exceptions.BusinessNotFoundException;
import com.envisionad.webservice.business.exceptions.DuplicateBusinessNameException;
import com.envisionad.webservice.business.exceptions.InvitationNotFoundException;
import com.envisionad.webservice.business.mappinglayer.BusinessMapper;
import com.envisionad.webservice.business.mappinglayer.EmployeeMapper;
import com.envisionad.webservice.business.mappinglayer.InvitationMapper;
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

    private final BusinessMapper businessMapper;

    private final EmployeeMapper employeeMapper;

    private final InvitationMapper invitationMapper;

    public BusinessServiceImpl(EmailService emailService, BusinessRepository businessRepository, InvitationRepository invitationRepository, EmployeeRepository employeeRepository, BusinessMapper businessMapper, EmployeeMapper employeeMapper, InvitationMapper invitationMapper) {
        this.emailService = emailService;
        this.businessRepository = businessRepository;
        this.invitationRepository = invitationRepository;
        this.employeeRepository = employeeRepository;
        this.businessMapper = businessMapper;
        this.employeeMapper = employeeMapper;
        this.invitationMapper = invitationMapper;
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

        return businessMapper.toResponse(businessRepository.save(business));
    }

    @Override
    public List<BusinessResponseModel> getAllBusinesses() {
        return businessRepository.findAll().stream().map(businessMapper::toResponse).collect(Collectors.toList());
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

        String userId = extractUserId(jwt);
        validateUserIsEmployeeOfBusiness(userId, businessId);

        Business newBusiness = businessMapper.toEntity(businessRequestModel);
        newBusiness.setId(existingBusiness.getId());
        newBusiness.setBusinessId(existingBusiness.getBusinessId());
        newBusiness.setOwnerId(existingBusiness.getOwnerId());

        return businessMapper.toResponse(businessRepository.save(newBusiness));
    }

    @Override
    public InvitationResponseModel createInvitation(Jwt jwt, String businessId, InvitationRequestModel invitationRequest) {
        Business business = businessRepository.findByBusinessId_BusinessId(businessId);
        if (business == null)
            throw new BusinessNotFoundException();

        String userId = extractUserId(jwt);
        validateUserIsEmployeeOfBusiness(userId, businessId);

        String token = UUID.randomUUID().toString();
        Invitation invitation =  invitationMapper.toEntity(invitationRequest);
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

        List<Employee> employees = employeeRepository.findAllByBusinessId_BusinessId(businessId);

        String userId = extractUserId(jwt);
        if (employees.stream().noneMatch(e -> e.getUserId().equals(userId)))
            throw new AccessDeniedException("Access Denied");


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
        if (!businessRepository.existsByBusinessId_BusinessId(businessId))
            throw new BusinessNotFoundException();

        List<Employee> employees = employeeRepository.findAllByBusinessId_BusinessId(businessId);

        String userId = extractUserId(jwt);
        validateUserIsEmployeeOfBusiness(userId, businessId);

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
        boolean isEmployee = employeeRepository.existsByUserIdAndBusinessId_BusinessId(userId, businessId);
        if (!isEmployee)
            throw new AccessDeniedException("Access Denied");
    }
}
