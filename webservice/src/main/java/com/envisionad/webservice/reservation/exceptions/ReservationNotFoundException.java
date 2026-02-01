package com.envisionad.webservice.reservation.exceptions;

public class ReservationNotFoundException extends RuntimeException {
    public ReservationNotFoundException(String mediaId, String campaignId) {
        super("No confirmed reservation found for campaignId=" + campaignId + " on mediaId=" + mediaId);
    }

    public ReservationNotFoundException(String reservationId) {
        super("No reservation found with reservationId: " + reservationId);
    }
}
