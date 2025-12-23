package com.envisionad.webservice.business.presentationlayer.models;

import com.envisionad.webservice.business.dataaccesslayer.Address;
import com.envisionad.webservice.business.dataaccesslayer.OrganizationSize;
import com.envisionad.webservice.business.dataaccesslayer.Roles;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class BusinessRequestModel {
    private String name;
    private OrganizationSize organizationSize;
    private Address address;
    private Roles roles;
}
