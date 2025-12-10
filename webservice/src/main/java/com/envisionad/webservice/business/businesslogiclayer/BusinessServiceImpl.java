package com.envisionad.webservice.business.businesslogiclayer;

import com.envisionad.webservice.business.dataaccesslayer.Business;
import com.envisionad.webservice.business.dataaccesslayer.BusinessRepository;
import com.envisionad.webservice.utils.exceptions.BusinessEmployeeNotFoundException;
import com.envisionad.webservice.utils.exceptions.BusinessNotFoundException;
import com.envisionad.webservice.utils.exceptions.DuplicateBusinessEmployeeException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class BusinessServiceImpl implements BusinessService {

    private final BusinessRepository businessRepository;

    public BusinessServiceImpl(BusinessRepository businessRepository) {
        this.businessRepository = businessRepository;
    }

    @Override
    public Business createBusiness(Business business) {
        if (businessRepository.existsByName(business.getName())) {
            throw new RuntimeException("Business with name " + business.getName() + " already exists"); //TODO use custom error
        }
        return businessRepository.save(business);
    }

    @Override
    public List<Business> getAllBusinesses() {
        return businessRepository.findAll();
    }

    @Override
    public Business getBusinessById(UUID id) {
        return businessRepository.findById(id)
                .orElseThrow(() -> new BusinessNotFoundException(id));
    }

    @Override
    public Business updateBusinessById(UUID id, Business business) {
        Business existingBusiness = businessRepository.findById(id)
                .orElseThrow(() -> new BusinessNotFoundException(id));
        existingBusiness.setName(business.getName());
        existingBusiness.setAddress(business.getAddress());
        existingBusiness.setCompanySize(business.getCompanySize());

        return businessRepository.save(existingBusiness);
    }

    @Override
    public Business deleteBusinessById(UUID id) {
        Business existingBusiness = businessRepository.findById(id)
                .orElseThrow(() -> new BusinessNotFoundException(id));
        businessRepository.delete(existingBusiness);
        return existingBusiness;
    }

    @Override
    public Business addBusinessEmployeeById(UUID businessId, String EmployeeId){
        Business existingBusiness = businessRepository.findById(businessId)
                .orElseThrow(() -> new BusinessNotFoundException(businessId));
        if (existingBusiness.getEmployeeIds().contains(EmployeeId))
            throw new DuplicateBusinessEmployeeException("Employee with id " + EmployeeId + " already exists");

        existingBusiness.getEmployeeIds().add(EmployeeId); //throw custom error if user is already in business
        return businessRepository.save(existingBusiness);
    }

    @Override
    public Business removeBusinessEmployeeById(UUID businessId, String EmployeeId){
        Business existingBusiness = businessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found with id: " + businessId));
        if (!existingBusiness.getEmployeeIds().contains(EmployeeId))
            throw new BusinessEmployeeNotFoundException("Employee with id " + EmployeeId + " not found");
        existingBusiness.getEmployeeIds().remove(EmployeeId); //throw custom error if user is not in business
        return businessRepository.save(existingBusiness);
    }
}
