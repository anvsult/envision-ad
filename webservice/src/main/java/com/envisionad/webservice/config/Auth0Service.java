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

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicReference;

@Service
@RequiredArgsConstructor
public class Auth0Service {

    private final RestTemplate restTemplate;

    @Value("${okta.oauth2.issuer}")
    private String issuer;

    @Value("${auth0.management.client-id}")
    private String managementClientId;

    @Value("${auth0.management.client-secret}")
    private String managementClientSecret;

    @Value("${auth0.management.audience}")
    private String managementAudience;

    /** Cached token entry: index 0 = access_token (String), index 1 = expiry (Instant). */
    private final AtomicReference<Object[]> cachedToken = new AtomicReference<>();

    private static final Duration TOKEN_TTL = Duration.ofHours(23);



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
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    issuer + "api/v2/users/" + userId,
                    HttpMethod.GET,
                    entity,
                    getMapTypeRef()
            );

            return (String) Objects.requireNonNull(response.getBody(), "Auth0 Management API returned null body for user: " + userId).get("email");
        } catch (HttpClientErrorException.NotFound e) {
            throw new Auth0UserNotFoundException(userId, e);
        } catch (RestClientException e) {
            throw new Auth0ServiceUnavailableException(
                    "Failed to retrieve email for user '" + userId + "' from Auth0 Management API", e);
        }
    }

    private String getManagementApiToken() {
        Object[] cached = cachedToken.get();
        if (cached != null && Instant.now().isBefore((Instant) cached[1])) {
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
                    issuer + "oauth/token",
                    HttpMethod.POST,
                    request,
                    getMapTypeRef()
            );

            String accessToken = (String) Objects.requireNonNull(response.getBody(), "Auth0 token endpoint returned null body").get("access_token");
            cachedToken.set(new Object[]{accessToken, Instant.now().plus(TOKEN_TTL)});
            return accessToken;
        } catch (RestClientException e) {
            throw new Auth0ServiceUnavailableException(
                    "Failed to obtain Auth0 Management API token", e);
        }
    }

    private ParameterizedTypeReference<Map<String, Object>> getMapTypeRef() {
        return new ParameterizedTypeReference<>() {};
    }
}