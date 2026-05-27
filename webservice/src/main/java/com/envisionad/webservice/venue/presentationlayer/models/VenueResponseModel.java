package com.envisionad.webservice.venue.presentationlayer.models;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class VenueResponseModel {
    private String venueId;
    private String nameEn;
    private String nameFr;
    private String colorCode;
    private long mediaCount;
}
