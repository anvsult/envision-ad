package com.envisionad.webservice.business.BusinessLogicLayer;

import com.envisionad.webservice.business.DataAccessLayer.Business;

import java.util.List;
import java.util.UUID;

public interface BusinessService {

    Business createBusiness(Business business);

    List<Business> getAllBusinesses();

    Business getBusinessById(UUID id);
}