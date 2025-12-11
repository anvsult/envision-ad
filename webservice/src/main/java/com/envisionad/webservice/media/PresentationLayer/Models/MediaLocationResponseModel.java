package com.envisionad.webservice.media.PresentationLayer.Models;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MediaLocationResponseModel {
    private String id;
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
