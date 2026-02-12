package com.envisionad.webservice.media.BusinessLayer;

import com.envisionad.webservice.media.exceptions.GeocodingServiceUnavailableException;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GeocodingServiceImpl implements GeocodingService {

    private final WebClient webClient;
    private static final String NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";
    private static final Duration GEOCODING_TIMEOUT = Duration.ofSeconds(5);
    private static final Duration CACHE_TTL = Duration.ofHours(24);
    private static final int MAX_CACHE_ENTRIES = 5_000;
    private static final long MIN_REQUEST_INTERVAL_MS = 1_000L;

    private final Map<String, CacheEntry> geocodingCache = new ConcurrentHashMap<>();
    private final Object rateLimitLock = new Object();
    private long lastRequestTimeMs = 0L;

    public GeocodingServiceImpl(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl(NOMINATIM_BASE_URL).build();
    }

    private record CacheEntry(Optional<String> value, long expiresAtMs) {
    }

    @Override
    public Optional<String> geocodeAddress(String address) {
        String cacheKey = normalizeCacheKey(address);
        Optional<String> cachedResponse = getCached(cacheKey);
        if (cachedResponse != null) {
            return cachedResponse;
        }

        try {
            awaitRateLimitSlot();

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
                    .timeout(GEOCODING_TIMEOUT)
                    .block();

            Optional<String> result = (response != null && !response.equals("[]"))
                    ? Optional.of(response)
                    : Optional.empty();
            putCached(cacheKey, result);
            return result;
        } catch (Exception e) {
            throw new GeocodingServiceUnavailableException("Address validation service is temporarily unavailable.", e);
        }
    }

    private String normalizeCacheKey(String address) {
        if (address == null) {
            return "";
        }
        return address.trim().replaceAll("\\s+", " ").toLowerCase(Locale.ROOT);
    }

    private Optional<String> getCached(String cacheKey) {
        CacheEntry entry = geocodingCache.get(cacheKey);
        if (entry == null) {
            return null;
        }
        if (System.currentTimeMillis() >= entry.expiresAtMs()) {
            geocodingCache.remove(cacheKey);
            return null;
        }
        return entry.value();
    }

    private void putCached(String cacheKey, Optional<String> result) {
        evictExpiredEntries();
        if (geocodingCache.size() >= MAX_CACHE_ENTRIES) {
            geocodingCache.clear();
        }
        long expiresAtMs = System.currentTimeMillis() + CACHE_TTL.toMillis();
        geocodingCache.put(cacheKey, new CacheEntry(result, expiresAtMs));
    }

    private void evictExpiredEntries() {
        long nowMs = System.currentTimeMillis();
        geocodingCache.entrySet().removeIf(entry -> entry.getValue().expiresAtMs() <= nowMs);
    }

    private void awaitRateLimitSlot() throws InterruptedException {
        synchronized (rateLimitLock) {
            long nowMs = System.currentTimeMillis();
            long waitMs = MIN_REQUEST_INTERVAL_MS - (nowMs - lastRequestTimeMs);
            if (waitMs > 0) {
                Thread.sleep(waitMs);
            }
            lastRequestTimeMs = System.currentTimeMillis();
        }
    }
}
