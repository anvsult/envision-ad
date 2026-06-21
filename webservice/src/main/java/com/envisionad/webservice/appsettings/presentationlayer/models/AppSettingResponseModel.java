package com.envisionad.webservice.appsettings.presentationlayer.models;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AppSettingResponseModel {
    private String key;
    private String value;
}
