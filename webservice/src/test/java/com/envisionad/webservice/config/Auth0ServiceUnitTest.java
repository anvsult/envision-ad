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
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
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

    private static final String BASE_URL      = "https://dev-test.auth0.com/";
    private static final String CLIENT_ID     = "test-client-id";
    private static final String CLIENT_SECRET = "test-client-secret";
    private static final String AUDIENCE      = "https://dev-test.auth0.com/api/v2/";
    private static final String TOKEN_URL     = BASE_URL + "oauth/token";
    private static final String VALID_TOKEN   = "mocked-management-token";
    private static final String USER_ID       = "auth0|abc123";
    private static final String USER_EMAIL    = "advertiser@example.com";

    /** The URI that Auth0Service actually builds via UriComponentsBuilder.pathSegment(). */
    private static URI userUri() {
        return UriComponentsBuilder
                .fromUriString(BASE_URL)
                .pathSegment("api", "v2", "users", Auth0ServiceUnitTest.USER_ID)
                .build()
                .toUri();
    }

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(auth0Service, "managementTokenUrl",    TOKEN_URL);
        ReflectionTestUtils.setField(auth0Service, "managementBaseUrl",     BASE_URL);
        ReflectionTestUtils.setField(auth0Service, "managementClientId",    CLIENT_ID);
        ReflectionTestUtils.setField(auth0Service, "managementClientSecret", CLIENT_SECRET);
        ReflectionTestUtils.setField(auth0Service, "managementAudience",    AUDIENCE);
        // Clear the cached token between tests so each test starts fresh
        ReflectionTestUtils.setField(auth0Service, "cachedToken",
                new java.util.concurrent.atomic.AtomicReference<>());
    }

    // -------------------------------------------------------------------------
    // Helper stubs
    // -------------------------------------------------------------------------

    private void stubTokenEndpoint() {
        Map<String, Object> tokenBody = Map.of("access_token", Auth0ServiceUnitTest.VALID_TOKEN, "expires_in", 86400);
        when(restTemplate.exchange(
                eq(TOKEN_URL),
                eq(HttpMethod.POST),
                any(),
                ArgumentMatchers.<ParameterizedTypeReference<Map<String, Object>>>any()
        )).thenReturn(new ResponseEntity<>(tokenBody, HttpStatus.OK));
    }

    private void stubUserEndpoint() {
        Map<String, Object> userBody = Map.of("email", Auth0ServiceUnitTest.USER_EMAIL, "user_id", Auth0ServiceUnitTest.USER_ID);
        when(restTemplate.exchange(
                eq(userUri()),
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
        stubTokenEndpoint();
        stubUserEndpoint();

        // Act
        String result = auth0Service.getUserEmailByUserId(USER_ID);

        // Assert
        assertEquals(USER_EMAIL, result);
        verify(restTemplate, times(1)).exchange(eq(TOKEN_URL), eq(HttpMethod.POST), any(), ArgumentMatchers.<ParameterizedTypeReference<Map<String, Object>>>any());
        verify(restTemplate, times(1)).exchange(eq(userUri()), eq(HttpMethod.GET), any(), ArgumentMatchers.<ParameterizedTypeReference<Map<String, Object>>>any());
    }

    // =========================================================================
    // getUserEmailByUserId — 404 → Auth0UserNotFoundException
    // =========================================================================

    @Test
    void whenGetUserEmailByUserId_andUserNotFound_thenThrowsAuth0UserNotFoundException() {
        // Arrange
        stubTokenEndpoint();
        when(restTemplate.exchange(
                eq(userUri()),
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
    // getUserEmailByUserId — 401 → clears cache, retries, then throws
    // =========================================================================

    @Test
    void whenGetUserEmailByUserId_andUnauthorized_thenThrowsAuth0ServiceUnavailableException() {
        // Arrange — first token fetch succeeds; both user-endpoint calls (initial + retry) get 401
        stubTokenEndpoint();
        when(restTemplate.exchange(
                eq(userUri()),
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
        // The retry path wraps the second RestClientException as the cause
        assertNotNull(ex.getCause());
    }

    // =========================================================================
    // getUserEmailByUserId — network failure → Auth0ServiceUnavailableException
    // =========================================================================

    @Test
    void whenGetUserEmailByUserId_andNetworkFailure_thenThrowsAuth0ServiceUnavailableException() {
        // Arrange
        stubTokenEndpoint();
        when(restTemplate.exchange(
                eq(userUri()),
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
        stubTokenEndpoint();
        stubUserEndpoint();

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
                eq(userUri()),
                eq(HttpMethod.GET),
                any(),
                ArgumentMatchers.<ParameterizedTypeReference<Map<String, Object>>>any()
        );
    }

    // =========================================================================
    // Token caching — expired token triggers a fresh fetch
    // =========================================================================

    @Test
    void whenCachedTokenIsExpired_thenFetchesNewToken() throws Exception {
        // Arrange — pre-load an already-expired CachedToken into the cache
        Class<?> cachedTokenClass = Class.forName(
                "com.envisionad.webservice.config.Auth0Service$CachedToken");
        java.lang.reflect.Constructor<?> ctor =
                cachedTokenClass.getDeclaredConstructor(String.class, Instant.class);
        ctor.setAccessible(true);
        Object expiredToken = ctor.newInstance("expired-token", Instant.now().minusSeconds(60));

        var expiredCache = new java.util.concurrent.atomic.AtomicReference<>(expiredToken);
        ReflectionTestUtils.setField(auth0Service, "cachedToken", expiredCache);

        stubTokenEndpoint();
        stubUserEndpoint();

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
    void whenCachedTokenIsStillValid_thenTokenEndpointIsNotCalled() throws Exception {
        // Arrange — pre-load a still-valid CachedToken (expires in 22 hours)
        Class<?> cachedTokenClass = Class.forName(
                "com.envisionad.webservice.config.Auth0Service$CachedToken");
        java.lang.reflect.Constructor<?> ctor =
                cachedTokenClass.getDeclaredConstructor(String.class, Instant.class);
        ctor.setAccessible(true);
        Object validToken = ctor.newInstance(VALID_TOKEN, Instant.now().plusSeconds(22 * 3600));

        var validCache = new java.util.concurrent.atomic.AtomicReference<>(validToken);
        ReflectionTestUtils.setField(auth0Service, "cachedToken", validCache);

        stubUserEndpoint();

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

