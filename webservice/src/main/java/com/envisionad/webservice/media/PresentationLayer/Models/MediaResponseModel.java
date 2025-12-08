package com.envisionad.webservice.media.PresentationLayer.Models;

import com.envisionad.webservice.media.DataAccessLayer.Status;
import com.envisionad.webservice.media.DataAccessLayer.TypeOfDisplay;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;


@Data
@NoArgsConstructor
public class MediaResponseModel {
    private String id;
    private String title;
    private String mediaOwnerName;
    private String address;
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
}