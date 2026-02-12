package com.envisionad.webservice.media.BusinessLayer;

import com.envisionad.webservice.media.exceptions.GeocodingServiceUnavailableException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Optional;
import java.util.function.Function;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings({ "rawtypes", "unchecked" })
class GeocodingServiceImplTest {

    @Mock
    private WebClient.Builder webClientBuilder;
    @Mock
    private WebClient webClient;
    @Mock
    private WebClient.RequestHeadersUriSpec requestHeadersUriSpec;
    @Mock
    private WebClient.RequestHeadersSpec requestHeadersSpec;
    @Mock
    private WebClient.ResponseSpec responseSpec;

    private GeocodingServiceImpl geocodingService;

    @BeforeEach
    void setUp() {
        when(webClientBuilder.baseUrl(anyString())).thenReturn(webClientBuilder);
        when(webClientBuilder.build()).thenReturn(webClient);
        geocodingService = new GeocodingServiceImpl(webClientBuilder);
    }

    @Test
    void geocodeAddress_ValidAddress_ReturnsJson() {
        String jsonResponse = "[{\"lat\":\"45.5017\", \"lon\":\"-73.5673\"}]";

        // Use unchecked cast to avoid compilation error with raw/generic mismatch if
        // easy, or just suppress warnings
        // Actually, let's just use raw types or wildcards properly if possible.
        // WebClient generics are complex to mock perfectly.
        // Let's use simpler mocking if possible or suppress warnings.
        // Given the lints, I will suppress warnings for the test class or keys.

        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(Function.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.header(anyString(), anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(jsonResponse));

        Optional<String> result = geocodingService.geocodeAddress("Montreal, QC");

        assertTrue(result.isPresent());
        assertEquals(jsonResponse, result.get());
    }

    @Test
    void geocodeAddress_InvalidAddress_ReturnsEmpty() {
        String jsonResponse = "[]";

        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(Function.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.header(anyString(), anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(jsonResponse));

        Optional<String> result = geocodingService.geocodeAddress("Invalid Address");

        assertFalse(result.isPresent());
    }

    @Test
    void geocodeAddress_ApiError_ThrowsServiceUnavailableException() {
        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(Function.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.header(anyString(), anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.error(new RuntimeException("API Error")));

        GeocodingServiceUnavailableException exception = assertThrows(GeocodingServiceUnavailableException.class,
                () -> geocodingService.geocodeAddress("Montreal, QC"));
        assertEquals("Address validation service is temporarily unavailable.", exception.getMessage());
    }
}
