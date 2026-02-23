package com.envisionad.webservice.config;

import com.envisionad.webservice.config.exceptions.Auth0ServiceUnavailableException;
import com.envisionad.webservice.config.exceptions.Auth0UserNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicReference;
import java.util.concurrent.locks.ReentrantLock;

@Service
@RequiredArgsConstructor
public class Auth0Service {

    private final RestTemplate restTemplate;

    @Value("${auth0.management.client-id}")
    private String managementClientId;

    @Value("${auth0.management.client-secret}")
    private String managementClientSecret;

    @Value("${auth0.management.audience}")
    private String managementAudience;

    @Value("${auth0.management.token-url}")
    private String managementTokenUrl;

    @Value("${auth0.management.base-url}")
    private String managementBaseUrl;

    /** Cached token entry: index 0 = access_token (String), index 1 = expiry (Instant). */
    private final AtomicReference<Object[]> cachedToken = new AtomicReference<>();

    /** Guards the check-then-fetch-then-set refresh sequence against concurrent threads. */
    private final ReentrantLock tokenRefreshLock = new ReentrantLock();

    /** Safety buffer subtracted from expires_in to avoid using a token right at its boundary. */
    private static final Duration TOKEN_EXPIRY_BUFFER = Duration.ofSeconds(30);



    /**
     * Fetches the email for any user by their Auth0 user_id using the Management API
     * (server-to-server, no user JWT required). Always returns the latest email from Auth0.
     */
    public String getUserEmailByUserId(String userId) {
        String managementToken = getManagementApiToken();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(managementToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            java.net.URI uri = UriComponentsBuilder
                    .fromUriString(managementBaseUrl)
                    .pathSegment("api", "v2", "users", userId)
                    .build()
                    .toUri();

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    uri,
                    HttpMethod.GET,
                    entity,
                    getMapTypeRef()
            );

            return extractEmail(response, userId);
        } catch (HttpClientErrorException.Unauthorized e) {
            // Token may have expired early (clock drift, early revocation). Invalidate the
            // cache under the lock so no other thread races to use the stale entry, then
            // retry once with a freshly-fetched token before giving up.
            tokenRefreshLock.lock();
            try {
                cachedToken.set(null);
            } finally {
                tokenRefreshLock.unlock();
            }
            HttpHeaders retryHeaders = new HttpHeaders();
            retryHeaders.setBearerAuth(getManagementApiToken());
            HttpEntity<String> retryEntity = new HttpEntity<>(retryHeaders);
            try {
                java.net.URI uri = UriComponentsBuilder
                        .fromUriString(managementBaseUrl)
                        .pathSegment("api", "v2", "users", userId)
                        .build()
                        .toUri();
                ResponseEntity<Map<String, Object>> retryResponse = restTemplate.exchange(
                        uri,
                        HttpMethod.GET,
                        retryEntity,
                        getMapTypeRef()
                );
                return extractEmail(retryResponse, userId);
            } catch (RestClientException retryEx) {
                throw new Auth0ServiceUnavailableException(
                        "Failed to retrieve email for user '" + userId + "' from Auth0 Management API after token refresh", retryEx);
            }
        } catch (HttpClientErrorException.NotFound e) {
            throw new Auth0UserNotFoundException(userId, e);
        } catch (RestClientException e) {
            throw new Auth0ServiceUnavailableException(
                    "Failed to retrieve email for user '" + userId + "' from Auth0 Management API", e);
        }
    }

    private String getManagementApiToken() {
        // Fast path — lock-free read for the common case of a still-valid token.
        Object[] cached = cachedToken.get();
        if (isValid(cached)) {
            return (String) cached[0];
        }

        // Slow path — acquire lock so only one thread fetches a new token.
        tokenRefreshLock.lock();
        try {
            // Re-check after acquiring the lock; another thread may have already refreshed.
            cached = cachedToken.get();
            if (isValid(cached)) {
                return (String) cached[0];
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("grant_type", "client_credentials");
            body.add("client_id", managementClientId);
            body.add("client_secret", managementClientSecret);
            body.add("audience", managementAudience);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

            try {
                ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                        managementTokenUrl,
                        HttpMethod.POST,
                        request,
                        getMapTypeRef()
                );

                Map<String, Object> responseBody = Objects.requireNonNull(response.getBody(), "Auth0 token endpoint returned null body");
                String accessToken = (String) responseBody.get("access_token");
                if (accessToken == null || accessToken.isBlank()) {
                    throw new Auth0ServiceUnavailableException(
                            "Auth0 token endpoint returned a response without a valid access_token", null);
                }
                Number expiresIn = (Number) responseBody.getOrDefault("expires_in", 3600);
                Instant expiry = Instant.now().plusSeconds(expiresIn.longValue()).minus(TOKEN_EXPIRY_BUFFER);
                cachedToken.set(new Object[]{accessToken, expiry});
                return accessToken;
            } catch (RestClientException e) {
                throw new Auth0ServiceUnavailableException(
                        "Failed to obtain Auth0 Management API token", e);
            }
        } finally {
            tokenRefreshLock.unlock();
        }
    }

    /** Returns true only when the cache entry is non-null and its token has not yet expired. */
    private static boolean isValid(Object[] entry) {
        return entry != null && Instant.now().isBefore((Instant) entry[1]);
    }

    private String extractEmail(ResponseEntity<Map<String, Object>> response, String userId) {
        Map<String, Object> body = Objects.requireNonNull(
                response.getBody(), "Auth0 Management API returned null body for user: " + userId);
        String email = (String) body.get("email");
        if (email == null || email.isBlank()) {
            throw new Auth0ServiceUnavailableException(
                    "Auth0 Management API returned no email for user: " + userId, null);
        }
        return email;
    }

    private ParameterizedTypeReference<Map<String, Object>> getMapTypeRef() {
        return new ParameterizedTypeReference<>() {};
    }
}