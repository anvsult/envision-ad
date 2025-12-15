package com.envisionad.webservice.business.dataaccesslayer;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@Embeddable
@AllArgsConstructor
public class BusinessIdentifier {
    private String businessId;

    public BusinessIdentifier() {
        this.businessId = java.util.UUID.randomUUID().toString();
    }
}
