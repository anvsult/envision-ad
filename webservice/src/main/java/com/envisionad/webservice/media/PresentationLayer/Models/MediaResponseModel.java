package com.envisionad.webservice.media.PresentationLayer.Models;

import com.envisionad.webservice.business.presentationlayer.models.BusinessResponseModel;
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

    @Data
    @NoArgsConstructor
    public static class MediaLocationResponseModel {
        private UUID id;
        private String name;
        private String description;
        private String country;
        private String province;
        private String city;
        private String street;
        private String postalCode;
        private Double latitude;
        private Double longitude;
    }
}
