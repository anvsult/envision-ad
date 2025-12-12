package com.envisionad.webservice.business.businesslogiclayer;

import com.envisionad.webservice.business.dataaccesslayer.Business;
import com.envisionad.webservice.business.dataaccesslayer.BusinessRepository;
import com.envisionad.webservice.business.exceptions.BusinessEmployeeNotFoundException;
import com.envisionad.webservice.business.exceptions.DuplicateBusinessEmployeeException;
import com.envisionad.webservice.business.exceptions.DuplicateBusinessNameException;
import com.envisionad.webservice.business.mappinglayer.BusinessModelMapper;
import com.envisionad.webservice.business.presentationlayer.models.BusinessRequestModel;
import com.envisionad.webservice.business.presentationlayer.models.BusinessResponseModel;
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
    public BusinessResponseModel createBusiness(BusinessRequestModel business) {
        if (businessRepository.existsByName(business.getName())) {
            throw new DuplicateBusinessNameException(business.getName());
        }
        return businessModelMapper.entityToResponseModel(businessRepository.save(businessModelMapper.requestModelToEntity(business)));
    }

    @Override
    public List<BusinessResponseModel> getAllBusinesses() {
        return businessRepository.findAll().stream().map(businessModelMapper::entityToResponseModel).collect(Collectors.toList());
    }

    @Override
    public BusinessResponseModel getBusinessById(String id) {
        return businessModelMapper.entityToResponseModel(businessRepository.findByBusinessId_BusinessId(id)); //new BusinessNotFoundException(id));
    }

    @Override
    public BusinessResponseModel updateBusinessById(String id, BusinessRequestModel business) {
        Business existingBusiness = businessRepository.findByBusinessId_BusinessId(id);
        Business newBusiness = businessModelMapper.requestModelToEntity(business);
        existingBusiness.setName(newBusiness.getName());
        existingBusiness.setAddress(newBusiness.getAddress());
        existingBusiness.setCompanySize(newBusiness.getCompanySize());
        existingBusiness.setRoles(newBusiness.getRoles());

        return businessModelMapper.entityToResponseModel(businessRepository.save(existingBusiness));
    }

    @Override
    public BusinessResponseModel deleteBusinessById(String id) {
        Business existingBusiness = businessRepository.findByBusinessId_BusinessId(id);
        businessRepository.delete(existingBusiness);
        return businessModelMapper.entityToResponseModel(existingBusiness);
    }

    @Override
    public BusinessResponseModel addBusinessEmployeeById(String businessId, String EmployeeId) {
        Business existingBusiness = businessRepository.findByBusinessId_BusinessId(businessId);//.orElseThrow(() -> new BusinessNotFoundException(businessId));
        if (existingBusiness.getEmployeeIds().contains(EmployeeId))
            throw new DuplicateBusinessEmployeeException(businessId, EmployeeId);
        existingBusiness.getEmployeeIds().add(EmployeeId);
        return businessModelMapper.entityToResponseModel(businessRepository.save(existingBusiness));
    }

    @Override
    public BusinessResponseModel removeBusinessEmployeeById(String businessId, String EmployeeId) {
        Business existingBusiness = businessRepository.findByBusinessId_BusinessId(businessId);//.orElseThrow(() -> new BusinessNotFoundException(businessId));
        if (!existingBusiness.getEmployeeIds().contains(EmployeeId))
            throw new BusinessEmployeeNotFoundException(businessId, EmployeeId);
        existingBusiness.getEmployeeIds().remove(EmployeeId);
        return businessModelMapper.entityToResponseModel(businessRepository.save(existingBusiness));
    }

    @Override
    public BusinessResponseModel getBusinessByEmployeeId(String employeeId) { //TODO handle error here and everywhere else
        return businessModelMapper.entityToResponseModel(businessRepository.findByEmployeeIdsContains(employeeId));
    }
}
