package com.envisionad.webservice.media.PresentationLayer;

import com.envisionad.webservice.media.PresentationLayer.Models.MediaLocationValidationErrorResponse;
import com.envisionad.webservice.media.exceptions.GeocodingServiceUnavailableException;
import com.envisionad.webservice.media.exceptions.MediaLocationValidationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice(assignableTypes = MediaLocationController.class)
public class MediaLocationControllerAdvice {

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MediaLocationValidationException.class)
    public MediaLocationValidationErrorResponse handleMediaLocationValidationException(
            MediaLocationValidationException ex) {
        return new MediaLocationValidationErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), ex.getFieldErrors());
    }

    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    @ExceptionHandler(GeocodingServiceUnavailableException.class)
    public MediaLocationValidationErrorResponse handleGeocodingServiceUnavailableException(
            GeocodingServiceUnavailableException ex) {
        return new MediaLocationValidationErrorResponse(HttpStatus.SERVICE_UNAVAILABLE, ex.getMessage(), Map.of());
    }
}
