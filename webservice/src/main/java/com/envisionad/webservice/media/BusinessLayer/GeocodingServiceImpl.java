package com.envisionad.webservice.media.BusinessLayer;

import com.envisionad.webservice.media.exceptions.GeocodingServiceUnavailableException;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Optional;

@Service
public class GeocodingServiceImpl implements GeocodingService {

    private final WebClient webClient;
    private static final String NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";

    public GeocodingServiceImpl(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl(NOMINATIM_BASE_URL).build();
    }

    @Override
    public Optional<String> geocodeAddress(String address) {
        try {
            String response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search")
                            .queryParam("q", address)
                            .queryParam("format", "json")
                            .queryParam("addressdetails", 1)
                            .queryParam("limit", 1)
                            .build())
                    .header("User-Agent", "EnvisionAd/1.0") // Nominatim requires a User-Agent
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (response != null && !response.equals("[]")) {
                return Optional.of(response);
            }
        } catch (Exception e) {
            throw new GeocodingServiceUnavailableException("Address validation service is temporarily unavailable.", e);
        }
        return Optional.empty();
    }
}
