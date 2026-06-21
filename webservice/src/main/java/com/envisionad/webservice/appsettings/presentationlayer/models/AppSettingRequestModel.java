package com.envisionad.webservice.appsettings.presentationlayer.models;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AppSettingRequestModel {
    @NotBlank
    private String value;
}
