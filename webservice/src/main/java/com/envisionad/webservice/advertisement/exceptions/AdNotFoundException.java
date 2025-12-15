package com.envisionad.webservice.advertisement.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.NOT_FOUND, reason = "Ad not found")
public class AdNotFoundException extends RuntimeException {
    private static final String MESSAGE = "Ad with ID %s not found.";
    public AdNotFoundException(String adId) {
        super(MESSAGE.formatted(adId));
    }}
