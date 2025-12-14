package com.envisionad.webservice.advertisement.exceptions;

public class InvalidAdDurationException extends RuntimeException {
    private static final String MESSAGE = "The provided ad duration of %s seconds is not supported. Supported durations are 10, 15, and 30 seconds.";
    public InvalidAdDurationException(Integer durationInSeconds) {
        super(MESSAGE.formatted(durationInSeconds));
    }
}
