package com.envisionad.webservice.business.presentationLayer.models;

import com.envisionad.webservice.business.dataAccessLayer.CompanySize;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class BusinessRequestModel {

    private String name;
    private CompanySize companySize;
    private String street;
    private String city;
    private String state;
    private String zipCode;
    private String country;
}
