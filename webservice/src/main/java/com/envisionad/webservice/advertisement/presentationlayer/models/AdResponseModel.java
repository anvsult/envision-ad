package com.envisionad.webservice.advertisement.presentationlayer.models;

import com.envisionad.webservice.advertisement.dataaccesslayer.Ad;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class AdResponseModel {
    private String adId;
    private String campaignId;

    private String name;
    private String adUrl;
    private Integer adDurationSeconds;
    private String adType;
}
