package com.envisionad.webservice.media.PresentationLayer.Models;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
public class MediaLocationResponseModel {
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