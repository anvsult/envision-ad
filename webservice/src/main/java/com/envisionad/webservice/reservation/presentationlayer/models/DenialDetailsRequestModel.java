package com.envisionad.webservice.reservation.presentationlayer.models;

import com.envisionad.webservice.reservation.dataaccesslayer.DenialReason;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class DenialDetailsRequestModel {
    private DenialReason reason;
    private String description;
}
