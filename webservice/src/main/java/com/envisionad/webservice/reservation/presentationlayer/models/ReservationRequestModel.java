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
    private String mediaId;
    @NotBlank
    private String campaignId;
    @NotNull
    private LocalDateTime startDate;
    @NotNull
    private LocalDateTime endDate;

    // Optional: frontend may include a Stripe PaymentIntent id when payment completed
    private String paymentIntentId;

    // Optional: frontend may include a Stripe Checkout Session id when using Checkout
    private String checkoutSessionId;
}
