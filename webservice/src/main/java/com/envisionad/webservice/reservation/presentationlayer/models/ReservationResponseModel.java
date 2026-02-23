package com.envisionad.webservice.reservation.presentationlayer.models;

import com.envisionad.webservice.reservation.dataaccesslayer.DenialDetails;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class ReservationResponseModel {
    private String reservationId;
    private String mediaId;
    private String mediaTitle;
    private String mediaCity;
    private String campaignId;
    private String campaignName;
    private String advertiserBusinessId;
    private String advertiserBusinessName;
    private String status;
    private DenialDetails denialDetails;
    private Double totalPrice;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime createdAt;
}
