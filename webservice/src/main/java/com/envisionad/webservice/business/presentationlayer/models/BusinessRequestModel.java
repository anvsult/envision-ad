package com.envisionad.webservice.business.presentationlayer.models;

import com.envisionad.webservice.business.dataaccesslayer.CompanySize;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class BusinessRequestModel {
    private String name;
    private CompanySize companySize;
    private AddressRequestModel address;
    private String owner;
    private RoleResponseModel roles;
}
