package com.envisionad.webservice.config;

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
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Objects;

@Service
public class Auth0Service {

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String issuer;

    @Value("${auth0.management.client-id}")
    private String managementClientId;

    @Value("${auth0.management.client-secret}")
    private String managementClientSecret;

    @Value("${auth0.management.audience}")
    private String managementAudience;



    /**
     * Fetches the email for any user by their Auth0 user_id using the Management API
     * (server-to-server, no user JWT required). Always returns the latest email from Auth0.
     */
    public String getUserEmailByUserId(String userId) {
        String managementToken = getManagementApiToken();

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(managementToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                issuer + "api/v2/users/" + userId,
                HttpMethod.GET,
                entity,
                getMapTypeRef()
        );

        return (String) Objects.requireNonNull(response.getBody(), "Auth0 Management API returned null body for user: " + userId).get("email");
    }

    private String getManagementApiToken() {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "client_credentials");
        body.add("client_id", managementClientId);
        body.add("client_secret", managementClientSecret);
        body.add("audience", managementAudience);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                issuer + "oauth/token",
                HttpMethod.POST,
                request,
                getMapTypeRef()
        );

        return (String) Objects.requireNonNull(response.getBody(), "Auth0 token endpoint returned null body").get("access_token");
    }

    private ParameterizedTypeReference<Map<String, Object>> getMapTypeRef() {
        return new ParameterizedTypeReference<>() {};
    }
}