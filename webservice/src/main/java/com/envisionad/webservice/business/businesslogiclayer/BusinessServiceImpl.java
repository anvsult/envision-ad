package com.envisionad.webservice.business.businesslogiclayer;

import com.envisionad.webservice.business.dataaccesslayer.Business;
import com.envisionad.webservice.business.dataaccesslayer.BusinessRepository;
import com.envisionad.webservice.business.exceptions.BusinessEmployeeNotFoundException;
import com.envisionad.webservice.business.exceptions.BusinessNotFoundException;
import com.envisionad.webservice.business.exceptions.DuplicateBusinessEmployeeException;
import com.envisionad.webservice.business.exceptions.DuplicateBusinessNameException;
import com.envisionad.webservice.business.mappinglayer.BusinessModelMapper;
import com.envisionad.webservice.business.presentationlayer.models.BusinessRequestModel;
import com.envisionad.webservice.business.presentationlayer.models.BusinessResponseModel;
import com.envisionad.webservice.business.utils.Validator;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BusinessServiceImpl implements BusinessService {

    private final BusinessRepository businessRepository;

    private final BusinessModelMapper businessModelMapper;

    public BusinessServiceImpl(BusinessRepository businessRepository, BusinessModelMapper businessModelMapper) {
        this.businessRepository = businessRepository;
        this.businessModelMapper = businessModelMapper;
    }

    @Override
    public BusinessResponseModel createBusiness(Jwt jwt, BusinessRequestModel businessRequestModel) {
        Validator.validateBusiness(businessRequestModel);

        if (businessRepository.existsByName(businessRequestModel.getName()))
            throw new DuplicateBusinessNameException();

        String userId = jwt.getClaim("sub");
        if (userId == null || userId.isEmpty() || businessRepository.existsByEmployeeIdsContains(userId))
            throw new AccessDeniedException("Access Denied");

        Business business = businessModelMapper.requestModelToEntity(businessRequestModel);
        business.setOwnerId(userId);

        return businessModelMapper.entityToResponseModel(businessRepository.save(business));
    }

    @Override
    public List<BusinessResponseModel> getAllBusinesses() {
        return businessRepository.findAll().stream().map(businessModelMapper::entityToResponseModel).collect(Collectors.toList());
    }

    @Override
    public BusinessResponseModel getBusinessById(String id) {
        Business business = businessRepository.findByBusinessId_BusinessId(id);
        if (business == null)
            throw new BusinessNotFoundException();

        return businessModelMapper.entityToResponseModel(business);
    }

    @Override
    public BusinessResponseModel updateBusinessById(Jwt jwt, String id, BusinessRequestModel businessRequestModel) {
        Validator.validateBusiness(businessRequestModel);

        Business existingBusiness = businessRepository.findByBusinessId_BusinessId(id);
        if (existingBusiness == null)
            throw new BusinessNotFoundException();

        String userId = jwt.getClaim("sub");
        if (userId == null || userId.isEmpty() || !existingBusiness.getEmployeeIds().contains(userId))
            throw new AccessDeniedException("Access Denied");

        Business newBusiness = businessModelMapper.requestModelToEntity(businessRequestModel);
        newBusiness.setId(existingBusiness.getId());
        newBusiness.setBusinessId(existingBusiness.getBusinessId());
        newBusiness.setOwnerId(existingBusiness.getOwnerId());
        newBusiness.setEmployeeIds(existingBusiness.getEmployeeIds());

        return businessModelMapper.entityToResponseModel(businessRepository.save(newBusiness));
    }

    @Override //only here for testing, will be removed once the proper way of adding employees is done
    public BusinessResponseModel addBusinessEmployeeById(String businessId, String employeeId) {
        Business existingBusiness = businessRepository.findByBusinessId_BusinessId(businessId);
        if (existingBusiness.getEmployeeIds().contains(employeeId))
            throw new DuplicateBusinessEmployeeException();
        existingBusiness.getEmployeeIds().add(employeeId);
        return businessModelMapper.entityToResponseModel(businessRepository.save(existingBusiness));
    }

    @Override
    public BusinessResponseModel removeBusinessEmployeeById(Jwt jwt, String businessId, String employeeId) {
        Business business = businessRepository.findByBusinessId_BusinessId(businessId);
        if (business == null)
            throw new BusinessNotFoundException();

        String userId = jwt.getClaim("sub");
        if (userId == null || userId.isEmpty() || !business.getEmployeeIds().contains(userId))
            throw new AccessDeniedException("Access Denied");

        if (!business.getEmployeeIds().contains(employeeId))
            throw new BusinessEmployeeNotFoundException();
        business.getEmployeeIds().remove(employeeId);
        return businessModelMapper.entityToResponseModel(businessRepository.save(business));
    }

    @Override
    public BusinessResponseModel getBusinessByEmployeeId(Jwt jwt, String employeeId) {
        String userId = jwt.getClaim("sub");
        if (userId == null || userId.isEmpty() || !userId.equals(employeeId))
            throw new AccessDeniedException("Access Denied");

        Business business = businessRepository.findByEmployeeIdsContains(employeeId);
        if (business == null)
            throw new BusinessNotFoundException();

        return businessModelMapper.entityToResponseModel(business);
    }
}
