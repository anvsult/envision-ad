package com.envisionad.webservice.business.businesslogiclayer;

import com.envisionad.webservice.business.dataaccesslayer.Business;
import com.envisionad.webservice.business.presentationlayer.models.BusinessRequestModel;
import com.envisionad.webservice.business.presentationlayer.models.BusinessResponseModel;

import java.util.List;
import java.util.UUID;

public interface BusinessService {

    BusinessResponseModel createBusiness(BusinessRequestModel business);

    List<BusinessResponseModel> getAllBusinesses();

    BusinessResponseModel getBusinessById(String id);

    BusinessResponseModel updateBusinessById(String id, BusinessRequestModel business);

    BusinessResponseModel deleteBusinessById(String id);

    BusinessResponseModel addBusinessEmployeeById(String businessId, String EmployeeId);

    BusinessResponseModel removeBusinessEmployeeById(String id, String EmployeeId);

    BusinessResponseModel getBusinessByEmployeeId(String employeeId);
}