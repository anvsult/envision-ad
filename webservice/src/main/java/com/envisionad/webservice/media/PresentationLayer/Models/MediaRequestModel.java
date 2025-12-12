package com.envisionad.webservice.media.PresentationLayer.Models;

import com.envisionad.webservice.media.DataAccessLayer.MediaLocation;
import com.envisionad.webservice.media.DataAccessLayer.Status;
import com.envisionad.webservice.media.DataAccessLayer.TypeOfDisplay;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
public class MediaRequestModel {
    private String title;
    private String mediaOwnerName;
    private String mediaLocationId;
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
}
