package com.envisionad.webservice.media.PresentationLayer.Models;

import lombok.Getter;
import org.springframework.http.HttpStatus;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Getter
public class MediaLocationValidationErrorResponse {

    private final String timestamp;
    private final HttpStatus httpStatus;
    private final String message;
    private final Map<String, String> fieldErrors;

    public MediaLocationValidationErrorResponse(HttpStatus httpStatus, String message, Map<String, String> fieldErrors) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        ZonedDateTime now = ZonedDateTime.now(ZoneId.of("America/Montreal"));

        this.timestamp = now.format(formatter);
        this.httpStatus = httpStatus;
        this.message = message;
        this.fieldErrors = fieldErrors;
    }
}
