package com.envisionad.webservice.business.PresentationLayer.models;

import com.envisionad.webservice.business.DataAccessLayer.CompanySize;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
public class BusinessResponseModel {

    private UUID id;
    private String name;
    private CompanySize companySize;
    private AddressResponseModel address;
    private LocalDateTime dateCreated;

    @Data
    @NoArgsConstructor
    public static class AddressResponseModel {
        private UUID id;
        private String street;
        private String city;
        private String state;
        private String zipCode;
        private String country;
    }
}