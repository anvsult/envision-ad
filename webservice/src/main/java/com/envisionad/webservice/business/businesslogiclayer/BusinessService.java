package com.envisionad.webservice.business.businesslogiclayer;

import com.envisionad.webservice.business.presentationlayer.models.BusinessRequestModel;
import com.envisionad.webservice.business.presentationlayer.models.BusinessResponseModel;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;

public interface BusinessService {
    BusinessResponseModel createBusiness(Jwt jwt, BusinessRequestModel business);

    List<BusinessResponseModel> getAllBusinesses();

    BusinessResponseModel getBusinessById(String id);

    BusinessResponseModel updateBusinessById(Jwt jwt, String id, BusinessRequestModel business);

    BusinessResponseModel addBusinessEmployeeById(String businessId, String employeeId);

    BusinessResponseModel removeBusinessEmployeeById(Jwt jwt, String id, String employeeId);

    BusinessResponseModel getBusinessByEmployeeId(Jwt jwt, String employeeId);
}