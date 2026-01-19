package com.envisionad.webservice.business.dataaccesslayer;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@Embeddable
@AllArgsConstructor
public class VerificationIdentifier {
    private String verificationId;

    public VerificationIdentifier() {
        this.verificationId = java.util.UUID.randomUUID().toString();
    }
}
