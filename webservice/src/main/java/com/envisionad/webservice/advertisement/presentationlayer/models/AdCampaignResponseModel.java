package com.envisionad.webservice.advertisement.presentationlayer.models;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
public class AdCampaignResponseModel {
    private String campaignId;

    private String name;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    private List<AdResponseModel> ads;
}
