package com.envisionad.webservice.reservation.dataaccesslayer;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class DenialDetails {
    private DenialReason reason;
    private String description;
}
