package com.envisionad.webservice.reservation.dataaccesslayer;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Embeddable
public class DenialDetails {
    @Enumerated(EnumType.STRING)
    private DenialReason reason;

    @Column(length = 512)
    private String description;
}
