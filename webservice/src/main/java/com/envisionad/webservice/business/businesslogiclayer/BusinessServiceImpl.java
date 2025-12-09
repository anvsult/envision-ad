package com.envisionad.webservice.business.businesslogiclayer;

import com.envisionad.webservice.business.dataaccesslayer.Business;
import com.envisionad.webservice.business.dataaccesslayer.BusinessRepository;
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
                .orElseThrow(() -> new RuntimeException("Business not found with id: " + id)); //TODO use custom error
    }

    @Override
    public Business updateBusinessById(UUID id, Business business) {
        Business existingBusiness = businessRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Business not found with id: " + id)); //TODO use custom error
        existingBusiness.setName(business.getName());
        existingBusiness.setAddress(business.getAddress());
        existingBusiness.setCompanySize(business.getCompanySize());

        return businessRepository.save(existingBusiness);
    }

    @Override
    public Business deleteBusinessById(UUID id) {
        Business existingBusiness = businessRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Business not found with id: " + id)); //TODO use custom error
        businessRepository.delete(existingBusiness);
        return existingBusiness;
    }

    @Override
    public Business addBusinessEmployeeById(UUID businessId, String EmployeeId){
        Business existingBusiness = businessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found with id: " + businessId));
        //TODO ADD THE EMPLOYEE HERE
        return businessRepository.save(existingBusiness);
    }

    @Override
    public Business removeBusinessEmployeeById(UUID businessId, String EmployeeId){
        Business existingBusiness = businessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found with id: " + businessId));
        //TODO REMOVE THE EMPLOYEE HERE
        return businessRepository.save(existingBusiness);
    }
}
