package com.envisionad.webservice.advertisement.presentationlayer.models;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
public class AdCampaignRequestModel {
    private String name;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
