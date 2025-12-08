package com.envisionad.webservice.business.businessLogicLayer;

import com.envisionad.webservice.business.dataAccessLayer.Business;

import java.util.List;
import java.util.UUID;

public interface BusinessService {

    Business createBusiness(Business business);

    List<Business> getAllBusinesses();

    Business getBusinessById(UUID id);
}