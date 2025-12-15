package com.envisionad.webservice.business.businesslogiclayer;

import com.envisionad.webservice.business.presentationlayer.models.*;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;

public interface BusinessService {
    BusinessResponseModel createBusiness(Jwt jwt, BusinessRequestModel business);

    List<BusinessResponseModel> getAllBusinesses();

    BusinessResponseModel getBusinessById(String id);

    BusinessResponseModel updateBusinessById(Jwt jwt, String id, BusinessRequestModel business);

    List<InvitationResponseModel> getAllInvitationsByBusinessId(Jwt jwt, String businessId);

    InvitationResponseModel createInvitation(Jwt jwt, String businessId, InvitationRequestModel invitation);

    void cancelInvitation(Jwt jwt, String businessId, String invitationId);

    List<EmployeeResponseModel> getAllEmployeesByBusinessId(Jwt jwt, String businessId);

    EmployeeResponseModel addBusinessEmployee(Jwt jwt, String businessId, String token);

    void removeBusinessEmployeeById(Jwt jwt, String id, String employeeId);

    BusinessResponseModel getBusinessByUserId(Jwt jwt, String employeeId);
}