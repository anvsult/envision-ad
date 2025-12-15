package com.envisionad.webservice.advertisement.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.NOT_FOUND, reason = "Ad Campaign not found")
public class AdCampaignNotFoundException extends RuntimeException {
    private static final String MESSAGE = "Ad Campaign with ID %s not found.";
    public AdCampaignNotFoundException(String campaignId) {
        super(MESSAGE.formatted(campaignId));
    }
}
