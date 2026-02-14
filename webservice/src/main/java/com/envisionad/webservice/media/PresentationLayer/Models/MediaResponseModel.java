package com.envisionad.webservice.media.PresentationLayer.Models;

import com.envisionad.webservice.media.DataAccessLayer.Status;
import com.envisionad.webservice.media.DataAccessLayer.TypeOfDisplay;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
public class MediaResponseModel {
    private UUID id;
    private String title;
    private String mediaOwnerName;
    private MediaLocationResponseModel mediaLocation;
    private TypeOfDisplay typeOfDisplay;
    private Integer loopDuration;
    private String resolution;
    private String aspectRatio;
    private Double width;
    private Double height;
    private BigDecimal price;
    private Integer dailyImpressions;
    private ScheduleModel schedule;
    private Status status;
    private String imageUrl;
    private String businessId;
    private String businessName;
    private String previewConfiguration;


}
