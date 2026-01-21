package com.envisionad.webservice.payment.presentationlayer.models;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentIntentRequestModel {
    private String reservationId;
    private BigDecimal amount;
    private String mediaId;
    private String campaignId;
    private String businessId;
}