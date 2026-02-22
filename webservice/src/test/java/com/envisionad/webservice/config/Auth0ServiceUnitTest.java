package com.envisionad.webservice.config;

import com.envisionad.webservice.config.exceptions.Auth0ServiceUnavailableException;
import com.envisionad.webservice.config.exceptions.Auth0UserNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class Auth0ServiceUnitTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private Auth0Service auth0Service;

    private static final String ISSUER       = "https://dev-test.auth0.com/";
    private static final String CLIENT_ID    = "test-client-id";
    private static final String CLIENT_SECRET = "test-client-secret";
    private static final String AUDIENCE     = "https://dev-test.auth0.com/api/v2/";
    private static final String TOKEN_URL    = ISSUER + "oauth/token";
    private static final String VALID_TOKEN  = "mocked-management-token";
    private static final String USER_ID      = "auth0|abc123";
    private static final String USER_EMAIL   = "advertiser@example.com";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(auth0Service, "issuer",               ISSUER);
        ReflectionTestUtils.setField(auth0Service, "managementClientId",   CLIENT_ID);
        ReflectionTestUtils.setField(auth0Service, "managementClientSecret", CLIENT_SECRET);
        ReflectionTestUtils.setField(auth0Service, "managementAudience",   AUDIENCE);
        // Clear the cached token between tests so each test starts fresh
        ReflectionTestUtils.setField(auth0Service, "cachedToken",
                new java.util.concurrent.atomic.AtomicReference<>());
    }

    // -------------------------------------------------------------------------
    // Helper stubs
    // -------------------------------------------------------------------------

    private void stubTokenEndpoint(String token) {
        Map<String, Object> tokenBody = Map.of("access_token", token);
        when(restTemplate.exchange(
                eq(TOKEN_URL),
                eq(HttpMethod.POST),
                any(),
                ArgumentMatchers.<ParameterizedTypeReference<Map<String, Object>>>any()
        )).thenReturn(new ResponseEntity<>(tokenBody, HttpStatus.OK));
    }

    private void stubUserEndpoint(String userId, String email) {
        Map<String, Object> userBody = Map.of("email", email, "user_id", userId);
        when(restTemplate.exchange(
                eq(ISSUER + "api/v2/users/" + userId),
                eq(HttpMethod.GET),
                any(),
                ArgumentMatchers.<ParameterizedTypeReference<Map<String, Object>>>any()
        )).thenReturn(new ResponseEntity<>(userBody, HttpStatus.OK));
    }

    // =========================================================================
    // getUserEmailByUserId — happy path
    // =========================================================================

    @Test
    void whenGetUserEmailByUserId_withValidUserId_thenReturnsEmail() {
        // Arrange
        stubTokenEndpoint(VALID_TOKEN);
        stubUserEndpoint(USER_ID, USER_EMAIL);

        // Act
        String result = auth0Service.getUserEmailByUserId(USER_ID);

        // Assert
        assertEquals(USER_EMAIL, result);
        verify(restTemplate, times(1)).exchange(eq(TOKEN_URL), eq(HttpMethod.POST), any(), ArgumentMatchers.<ParameterizedTypeReference<Map<String, Object>>>any());
        verify(restTemplate, times(1)).exchange(eq(ISSUER + "api/v2/users/" + USER_ID), eq(HttpMethod.GET), any(), ArgumentMatchers.<ParameterizedTypeReference<Map<String, Object>>>any());
    }

    // =========================================================================
    // getUserEmailByUserId — 404 → Auth0UserNotFoundException
    // =========================================================================

    @Test
    void whenGetUserEmailByUserId_andUserNotFound_thenThrowsAuth0UserNotFoundException() {
        // Arrange
        stubTokenEndpoint(VALID_TOKEN);
        when(restTemplate.exchange(
                eq(ISSUER + "api/v2/users/" + USER_ID),
                eq(HttpMethod.GET),
                any(),
                ArgumentMatchers.<ParameterizedTypeReference<Map<String, Object>>>any()
        )).thenThrow(HttpClientErrorException.create(HttpStatus.NOT_FOUND, "Not Found", null, null, null));

        // Act & Assert
        Auth0UserNotFoundException ex = assertThrows(
                Auth0UserNotFoundException.class,
                () -> auth0Service.getUserEmailByUserId(USER_ID)
        );
        assertTrue(ex.getMessage().contains(USER_ID));
    }

    // =========================================================================
    // getUserEmailByUserId — 401 → Auth0ServiceUnavailableException
    // =========================================================================

    @Test
    void whenGetUserEmailByUserId_andUnauthorized_thenThrowsAuth0ServiceUnavailableException() {
        // Arrange
        stubTokenEndpoint(VALID_TOKEN);
        when(restTemplate.exchange(
                eq(ISSUER + "api/v2/users/" + USER_ID),
                eq(HttpMethod.GET),
                any(),
                ArgumentMatchers.<ParameterizedTypeReference<Map<String, Object>>>any()
        )).thenThrow(HttpClientErrorException.create(HttpStatus.UNAUTHORIZED, "Unauthorized", null, null, null));

        // Act & Assert
        Auth0ServiceUnavailableException ex = assertThrows(
                Auth0ServiceUnavailableException.class,
                () -> auth0Service.getUserEmailByUserId(USER_ID)
        );
        assertTrue(ex.getMessage().contains(USER_ID));
        assertInstanceOf(HttpClientErrorException.class, ex.getCause());
    }

    // =========================================================================
    // getUserEmailByUserId — network failure → Auth0ServiceUnavailableException
    // =========================================================================

    @Test
    void whenGetUserEmailByUserId_andNetworkFailure_thenThrowsAuth0ServiceUnavailableException() {
        // Arrange
        stubTokenEndpoint(VALID_TOKEN);
        when(restTemplate.exchange(
                eq(ISSUER + "api/v2/users/" + USER_ID),
                eq(HttpMethod.GET),
                any(),
                ArgumentMatchers.<ParameterizedTypeReference<Map<String, Object>>>any()
        )).thenThrow(new ResourceAccessException("Connection refused"));

        // Act & Assert
        Auth0ServiceUnavailableException ex = assertThrows(
                Auth0ServiceUnavailableException.class,
                () -> auth0Service.getUserEmailByUserId(USER_ID)
        );
        assertInstanceOf(ResourceAccessException.class, ex.getCause());
    }

    // =========================================================================
    // getManagementApiToken — token endpoint failure → Auth0ServiceUnavailableException
    // =========================================================================

    @Test
    void whenGetManagementApiToken_andTokenEndpointFails_thenThrowsAuth0ServiceUnavailableException() {
        // Arrange
        when(restTemplate.exchange(
                eq(TOKEN_URL),
                eq(HttpMethod.POST),
                any(),
                ArgumentMatchers.<ParameterizedTypeReference<Map<String, Object>>>any()
        )).thenThrow(HttpClientErrorException.create(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", null, null, null));

        // Act & Assert
        Auth0ServiceUnavailableException ex = assertThrows(
                Auth0ServiceUnavailableException.class,
                () -> auth0Service.getUserEmailByUserId(USER_ID)
        );
        assertTrue(ex.getMessage().contains("Failed to obtain Auth0 Management API token"));
        assertInstanceOf(HttpClientErrorException.class, ex.getCause());
    }

    // =========================================================================
    // Token caching — cached token is reused across multiple calls
    // =========================================================================

    @Test
    void whenGetUserEmailByUserId_calledMultipleTimes_thenTokenEndpointCalledOnlyOnce() {
        // Arrange
        stubTokenEndpoint(VALID_TOKEN);
        stubUserEndpoint(USER_ID, USER_EMAIL);

        // Act
        auth0Service.getUserEmailByUserId(USER_ID);
        auth0Service.getUserEmailByUserId(USER_ID);
        auth0Service.getUserEmailByUserId(USER_ID);

        // Assert — token fetched exactly once despite three email lookups
        verify(restTemplate, times(1)).exchange(
                eq(TOKEN_URL),
                eq(HttpMethod.POST),
                any(),
                ArgumentMatchers.<ParameterizedTypeReference<Map<String, Object>>>any()
        );
        verify(restTemplate, times(3)).exchange(
                eq(ISSUER + "api/v2/users/" + USER_ID),
                eq(HttpMethod.GET),
                any(),
                ArgumentMatchers.<ParameterizedTypeReference<Map<String, Object>>>any()
        );
    }

    // =========================================================================
    // Token caching — expired token triggers a fresh fetch
    // =========================================================================

    @Test
    void whenCachedTokenIsExpired_thenFetchesNewToken() {
        // Arrange — pre-load an already-expired token into the cache
        var expiredCache = new java.util.concurrent.atomic.AtomicReference<>(
                new Object[]{"expired-token", Instant.now().minusSeconds(60)}
        );
        ReflectionTestUtils.setField(auth0Service, "cachedToken", expiredCache);

        stubTokenEndpoint(VALID_TOKEN);
        stubUserEndpoint(USER_ID, USER_EMAIL);

        // Act
        String result = auth0Service.getUserEmailByUserId(USER_ID);

        // Assert — a fresh token was fetched and the correct email was returned
        assertEquals(USER_EMAIL, result);
        verify(restTemplate, times(1)).exchange(
                eq(TOKEN_URL),
                eq(HttpMethod.POST),
                any(),
                ArgumentMatchers.<ParameterizedTypeReference<Map<String, Object>>>any()
        );
    }

    // =========================================================================
    // Token caching — valid cached token is not refreshed
    // =========================================================================

    @Test
    void whenCachedTokenIsStillValid_thenTokenEndpointIsNotCalled() {
        // Arrange — pre-load a still-valid token (expires in 22 hours)
        var validCache = new java.util.concurrent.atomic.AtomicReference<>(
                new Object[]{VALID_TOKEN, Instant.now().plusSeconds(22 * 3600)}
        );
        ReflectionTestUtils.setField(auth0Service, "cachedToken", validCache);

        stubUserEndpoint(USER_ID, USER_EMAIL);

        // Act
        String result = auth0Service.getUserEmailByUserId(USER_ID);

        // Assert — token endpoint was never hit
        assertEquals(USER_EMAIL, result);
        verify(restTemplate, never()).exchange(
                eq(TOKEN_URL),
                eq(HttpMethod.POST),
                any(),
                ArgumentMatchers.<ParameterizedTypeReference<Map<String, Object>>>any()
        );
    }
}

