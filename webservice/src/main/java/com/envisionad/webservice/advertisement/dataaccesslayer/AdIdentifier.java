package com.envisionad.webservice.advertisement.dataaccesslayer;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@Embeddable
@AllArgsConstructor
public class AdIdentifier {
    @Column(name = "ad_id")
    private String adId;

    public AdIdentifier() {
        this.adId = java.util.UUID.randomUUID().toString();
    }
}
