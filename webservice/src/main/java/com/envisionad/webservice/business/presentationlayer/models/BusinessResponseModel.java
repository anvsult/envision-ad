package com.envisionad.webservice.business.presentationlayer.models;

import com.envisionad.webservice.business.dataaccesslayer.CompanySize;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
public class BusinessResponseModel {
    private UUID id;
    private String name;
    private CompanySize companySize;
    private AddressResponseModel address;
    private Set<String> employees;
    private LocalDateTime dateCreated;
}