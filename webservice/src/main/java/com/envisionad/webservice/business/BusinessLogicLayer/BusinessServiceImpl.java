package com.envisionad.webservice.business.BusinessLogicLayer;

import com.envisionad.webservice.business.DataAccessLayer.Business;
import com.envisionad.webservice.business.DataAccessLayer.BusinessRepository;
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
}
