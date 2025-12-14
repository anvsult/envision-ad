package com.envisionad.webservice.advertisement.dataaccesslayer;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@Embeddable
@AllArgsConstructor
public class AdCampaignIdentifier {
    @Column(name = "campaign_id")
    private String campaignId;

    public AdCampaignIdentifier() {
        this.campaignId = java.util.UUID.randomUUID().toString();
    }
}
