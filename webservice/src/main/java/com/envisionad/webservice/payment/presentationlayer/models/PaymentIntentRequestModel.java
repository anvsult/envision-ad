package com.envisionad.webservice.payment.presentationlayer.models;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PaymentIntentRequestModel {
    private String reservationId;
    private String mediaId;
    private String campaignId;
    private String businessId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}