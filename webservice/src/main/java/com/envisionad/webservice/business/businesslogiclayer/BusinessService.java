package com.envisionad.webservice.business.businesslogiclayer;

import com.envisionad.webservice.business.dataaccesslayer.Business;

import java.util.List;
import java.util.UUID;

public interface BusinessService {

    Business createBusiness(Business business);

    List<Business> getAllBusinesses();

    Business getBusinessById(UUID id);
}