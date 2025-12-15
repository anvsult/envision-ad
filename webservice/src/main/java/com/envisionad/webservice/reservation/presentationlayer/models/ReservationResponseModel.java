package com.envisionad.webservice.reservation.presentationlayer.models;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@NoArgsConstructor
public class ReservationResponseModel {
    private String reservationId;
    private String mediaId;
    private String campaignId;
    private String status;
    private Double totalPrice;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}