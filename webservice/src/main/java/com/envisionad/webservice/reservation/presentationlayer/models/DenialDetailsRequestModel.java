package com.envisionad.webservice.reservation.presentationlayer.models;

import com.envisionad.webservice.reservation.dataaccesslayer.DenialReason;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

@Data
@NoArgsConstructor
public class DenialDetailsRequestModel {
    @NotNull
    private DenialReason reason;
    @Size(max = 512)
    private String description;
}
