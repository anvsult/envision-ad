package com.envisionad.webservice.business.presentationlayer.models;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AddressResponseModel {
    private String street;
    private String city;
    private String state;
    private String zipCode;
    private String country;
}
