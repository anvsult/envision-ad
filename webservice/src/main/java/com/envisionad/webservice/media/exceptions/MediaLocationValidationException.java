package com.envisionad.webservice.media.exceptions;

import lombok.Getter;

import java.util.Map;

@Getter
public class MediaLocationValidationException extends RuntimeException {

    private final Map<String, String> fieldErrors;

    public MediaLocationValidationException(String message, Map<String, String> fieldErrors) {
        super(message);
        this.fieldErrors = fieldErrors;
    }

    public MediaLocationValidationException(String message, Map<String, String> fieldErrors, Throwable cause) {
        super(message, cause);
        this.fieldErrors = fieldErrors;
    }

}
