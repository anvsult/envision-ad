package com.envisionad.webservice.advertisement.exceptions;

public class CampaignHasConfirmedReservationException extends RuntimeException {
    public CampaignHasConfirmedReservationException(String campaignId) {
        super("Campaign is associated with a confirmed reservation: " + campaignId);
    }
}
