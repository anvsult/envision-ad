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
            throw new RuntimeException("Business with name " + business.getName() + " already exists");
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
                .orElseThrow(() -> new RuntimeException("Business not found with id: " + id));
    }

    @Override
    public Business updateBusinessById(UUID id, Business business) {

        Business existingBusiness = businessRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Business not found with id: " + id));
        // Update fields of existingBusiness as needed
        existingBusiness.setName(business.getName());
        existingBusiness.setAddress(business.getAddress());
        existingBusiness.setCompanySize(business.getCompanySize());
        existingBusiness.setDateCreated(business.getDateCreated());

        return businessRepository.save(existingBusiness);
    }

    @Override
    public Business deleteBusinessById(UUID id) {
        Business existingBusiness = businessRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Business not found with id: " + id));
        businessRepository.delete(existingBusiness);
        return existingBusiness;
    }
}
