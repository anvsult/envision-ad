package com.envisionad.webservice.advertisement.presentationlayer.models;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AdRequestModel {
    private String name;
    private String adUrl;
    private String adType;
}
