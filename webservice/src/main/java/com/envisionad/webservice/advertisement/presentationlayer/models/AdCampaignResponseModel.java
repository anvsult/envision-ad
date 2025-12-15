package com.envisionad.webservice.advertisement.presentationlayer.models;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class AdCampaignResponseModel {
    private String campaignId;

    private String name;
    private List<AdResponseModel> ads;
}
