package com.envisionad.webservice.business.presentationlayer.models;

import com.envisionad.webservice.business.dataaccesslayer.Address;
import com.envisionad.webservice.business.dataaccesslayer.CompanySize;
import com.envisionad.webservice.business.dataaccesslayer.Roles;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class BusinessResponseModel {
    private String businessId;
    private String name;
    private String ownerId;
    private CompanySize companySize;
    private Address address;
    private Roles roles;
    private LocalDateTime dateCreated;
}