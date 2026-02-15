package com.envisionad.webservice.advertisement.exceptions;

public class CampaignHasApprovedReservationException extends RuntimeException {
    public CampaignHasApprovedReservationException(String campaignId) {
        super("Campaign is associated with an approved reservation: " + campaignId);
    }
}
