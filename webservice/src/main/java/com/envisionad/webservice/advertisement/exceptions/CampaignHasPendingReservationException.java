package com.envisionad.webservice.advertisement.exceptions;

public class CampaignHasPendingReservationException extends RuntimeException {
    public CampaignHasPendingReservationException(String campaignId) {
        super("Campaign is associated with a pending reservation: " + campaignId);
    }
}
