package com.envisionad.webservice.Media.PresentationLayer.Models;

import com.envisionad.webservice.Media.DataAccessLayer.Status;
import com.envisionad.webservice.Media.DataAccessLayer.TypeOfDisplay;
import com.envisionad.webservice.Media.PresentationLayer.Models.ScheduleModel;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
    public class MediaRequestModel {
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
        private ScheduleModel schedule;
        private Status status;
    }