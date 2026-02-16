package com.envisionad.webservice.reservation.presentationlayer.models;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@NoArgsConstructor
public class ReservationRequestModel {
    @NotBlank
    private String campaignId;
    @NotNull
    private LocalDateTime startDate;
    @NotNull
    private LocalDateTime endDate;

}
