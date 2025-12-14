package com.envisionad.webservice.advertisement.exceptions;

public class AdNotFoundException extends RuntimeException {
    private static final String MESSAGE = "Ad with ID %s not found.";
    public AdNotFoundException(String adId) {
        super(MESSAGE.formatted(adId));
    }}
