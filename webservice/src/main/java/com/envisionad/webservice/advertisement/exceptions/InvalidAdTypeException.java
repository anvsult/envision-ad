package com.envisionad.webservice.advertisement.exceptions;

public class InvalidAdTypeException extends RuntimeException {
    private static final String MESSAGE = "The provided ad type '%s' is invalid. Supported ad types are 'video' and 'image'.";
    public InvalidAdTypeException(String adType) {
        super(MESSAGE.formatted(adType));
    }
}
