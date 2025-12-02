package com.envisionad.webservice.Media.PresentationLayer.Models;

import com.envisionad.webservice.Media.DataAccessLayer.Status;
import com.envisionad.webservice.Media.DataAccessLayer.TypeOfDisplay;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MediaResponseModel {
    private Integer id;
    private String mediaOwnerName;
    private String title;
    private String resolution;
    private TypeOfDisplay typeOfDisplay;
    private String aspectRatio;
    private String address;
    private String schedule;
    private Status status;
}