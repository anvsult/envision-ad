package com.envisionad.webservice.business.presentationlayer.models;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class RoleRequestModel {
    private boolean isMediaOwner;
    private boolean isAdvertiser;
}
