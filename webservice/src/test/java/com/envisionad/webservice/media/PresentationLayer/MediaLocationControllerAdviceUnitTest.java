package com.envisionad.webservice.media.PresentationLayer;

import com.envisionad.webservice.media.PresentationLayer.Models.MediaLocationValidationErrorResponse;
import com.envisionad.webservice.media.exceptions.GeocodingServiceUnavailableException;
import com.envisionad.webservice.media.exceptions.MediaLocationValidationException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class MediaLocationControllerAdviceUnitTest {

    private final MediaLocationControllerAdvice advice = new MediaLocationControllerAdvice();

    @Test
    void handleMediaLocationValidationException_ShouldReturnBadRequestWithFieldErrors() {
        Map<String, String> fieldErrors = Map.of(
                "street", "Verify the street name or number.",
                "city", "Verify the city value.",
                "province", "Verify the province/state value.",
                "country", "Verify the country value.",
                "postalCode", "Verify the postal code value.");

        MediaLocationValidationException exception = new MediaLocationValidationException(
                "Address could not be verified. Please check street, city, province/state, country, and postal code.",
                fieldErrors);

        MediaLocationValidationErrorResponse response = advice.handleMediaLocationValidationException(exception);

        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST, response.getHttpStatus());
        assertEquals("Address could not be verified. Please check street, city, province/state, country, and postal code.",
                response.getMessage());
        assertEquals(fieldErrors, response.getFieldErrors());
    }

    @Test
    void handleGeocodingServiceUnavailableException_ShouldReturnServiceUnavailable() {
        GeocodingServiceUnavailableException exception = new GeocodingServiceUnavailableException(
                "Address validation service is temporarily unavailable. Please try again shortly.",
                new RuntimeException("timeout"));

        MediaLocationValidationErrorResponse response = advice.handleGeocodingServiceUnavailableException(exception);

        assertNotNull(response);
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getHttpStatus());
        assertEquals("Address validation service is temporarily unavailable. Please try again shortly.",
                response.getMessage());
        assertEquals(Map.of(), response.getFieldErrors());
    }
}
