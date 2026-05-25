package com.envisionad.webservice.venue.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.NOT_FOUND, reason = "Venue not found")
public class VenueNotFoundException extends RuntimeException {
    public VenueNotFoundException(String venueId) {
        super("Venue with ID " + venueId + " not found.");
    }
}
