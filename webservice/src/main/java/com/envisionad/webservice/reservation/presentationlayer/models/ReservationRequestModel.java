package com.envisionad.webservice.reservation.presentationlayer.models;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class ReservationRequestModel {
    private String mediaId;
    private String campaignId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
