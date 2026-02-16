package com.envisionad.webservice.advertisement.exceptions;

public class CampaignIsTiedToReservationException extends RuntimeException {
    public CampaignIsTiedToReservationException(String campaignId) {
        super("Operation not allowed because campaign has upcoming or ongoing reservations: " + campaignId);
    }
}
