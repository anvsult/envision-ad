package com.envisionad.webservice.media.BusinessLayer;

import com.envisionad.webservice.business.businesslogiclayer.BusinessService;
import com.envisionad.webservice.business.presentationlayer.models.BusinessResponseModel;
import com.envisionad.webservice.media.DataAccessLayer.MediaLocation;
import com.envisionad.webservice.media.DataAccessLayer.MediaLocationRepository;
import com.envisionad.webservice.media.DataAccessLayer.MediaRepository;
import com.envisionad.webservice.media.exceptions.GeocodingServiceUnavailableException;
import com.envisionad.webservice.media.exceptions.MediaLocationValidationException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MediaLocationServiceImplTest {

    @Mock
    private MediaLocationRepository mediaLocationRepository;
    @Mock
    private MediaRepository mediaRepository;
    @Mock
    private BusinessService businessService;
    @Mock
    private GeocodingService geocodingService;
    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private MediaLocationServiceImpl mediaLocationService;

    private MediaLocation mediaLocation;
    private final UUID businessId = UUID.randomUUID();
    private final String geocodingJson = "[{\"lat\":\"10.0\", \"lon\":\"20.0\"}]";

    @BeforeEach
    void setUp() {
        mediaLocation = new MediaLocation();
        mediaLocation.setStreet("123 Main St");
        mediaLocation.setCity("City");
        mediaLocation.setProvince("Province");
        mediaLocation.setCountry("Country");
        mediaLocation.setPostalCode("12345");
    }

    @Test
    void createMediaLocation_ValidAddress_SavesLocationWithCoordinates() throws Exception {
        Jwt jwt = mock(Jwt.class);
        when(jwt.getSubject()).thenReturn("auth0|123");
        BusinessResponseModel businessModel = new BusinessResponseModel();
        businessModel.setBusinessId(businessId.toString());
        when(businessService.getBusinessByUserId(any(), anyString())).thenReturn(businessModel);

        when(geocodingService.geocodeAddress(anyString())).thenReturn(Optional.of(geocodingJson));
        when(mediaLocationRepository.save(any(MediaLocation.class))).thenReturn(mediaLocation);

        JsonNode rootNode = mock(JsonNode.class);
        JsonNode firstResult = mock(JsonNode.class);
        JsonNode latNode = mock(JsonNode.class);
        JsonNode lonNode = mock(JsonNode.class);

        when(objectMapper.readTree(anyString())).thenReturn(rootNode);
        when(rootNode.isArray()).thenReturn(true);
        when(rootNode.size()).thenReturn(1);
        when(rootNode.get(0)).thenReturn(firstResult);
        when(firstResult.has("lat")).thenReturn(true);
        when(firstResult.get("lat")).thenReturn(latNode);
        when(latNode.asText()).thenReturn("10.0");
        when(firstResult.has("lon")).thenReturn(true);
        when(firstResult.get("lon")).thenReturn(lonNode);
        when(lonNode.asText()).thenReturn("20.0");

        MediaLocation result = mediaLocationService.createMediaLocation(mediaLocation, jwt);

        assertNotNull(result);
        assertEquals(10.0, result.getLatitude());
        assertEquals(20.0, result.getLongitude());
        assertEquals(geocodingJson, result.getGeocodingResponse());
        verify(mediaLocationRepository).save(mediaLocation);
    }

    @Test
    void createMediaLocation_FallbackAddressQuery_SavesLocationWithCoordinates() throws Exception {
        Jwt jwt = mock(Jwt.class);
        when(jwt.getSubject()).thenReturn("auth0|123");
        BusinessResponseModel businessModel = new BusinessResponseModel();
        businessModel.setBusinessId(businessId.toString());
        when(businessService.getBusinessByUserId(any(), anyString())).thenReturn(businessModel);

        // First candidate (strict full format) fails, fallback candidate succeeds.
        when(geocodingService.geocodeAddress(eq("123 Main St, City, Province, Country, 12345")))
                .thenReturn(Optional.empty());
        when(geocodingService.geocodeAddress(eq("123 Main St, City, Province, 12345, Country")))
                .thenReturn(Optional.of(geocodingJson));
        when(mediaLocationRepository.save(any(MediaLocation.class))).thenReturn(mediaLocation);

        JsonNode rootNode = mock(JsonNode.class);
        JsonNode firstResult = mock(JsonNode.class);
        JsonNode latNode = mock(JsonNode.class);
        JsonNode lonNode = mock(JsonNode.class);

        when(objectMapper.readTree(anyString())).thenReturn(rootNode);
        when(rootNode.isArray()).thenReturn(true);
        when(rootNode.size()).thenReturn(1);
        when(rootNode.get(0)).thenReturn(firstResult);
        when(firstResult.has("lat")).thenReturn(true);
        when(firstResult.get("lat")).thenReturn(latNode);
        when(latNode.asText()).thenReturn("10.0");
        when(firstResult.has("lon")).thenReturn(true);
        when(firstResult.get("lon")).thenReturn(lonNode);
        when(lonNode.asText()).thenReturn("20.0");

        MediaLocation result = mediaLocationService.createMediaLocation(mediaLocation, jwt);

        assertNotNull(result);
        assertEquals(10.0, result.getLatitude());
        assertEquals(20.0, result.getLongitude());
        assertEquals(geocodingJson, result.getGeocodingResponse());
        verify(geocodingService, atLeast(2)).geocodeAddress(anyString());
        verify(mediaLocationRepository).save(mediaLocation);
    }

    @Test
    void createMediaLocation_InvalidAddress_ThrowsException() {
        Jwt jwt = mock(Jwt.class);
        when(jwt.getSubject()).thenReturn("auth0|123");
        BusinessResponseModel businessModel = new BusinessResponseModel();
        businessModel.setBusinessId(businessId.toString());
        when(businessService.getBusinessByUserId(any(), anyString())).thenReturn(businessModel);

        when(geocodingService.geocodeAddress(anyString())).thenReturn(Optional.empty());
        when(geocodingService.geocodeAddress(eq("123 Main St, City, Province, 12345"))).thenReturn(Optional.of(geocodingJson));

        MediaLocationValidationException exception = assertThrows(MediaLocationValidationException.class, () -> {
            mediaLocationService.createMediaLocation(mediaLocation, jwt);
        });
        assertEquals("Address could not be verified. Please verify the country.",
                exception.getMessage());
        assertTrue(exception.getFieldErrors().containsKey("country"));
        assertEquals(1, exception.getFieldErrors().size());
        verify(mediaLocationRepository, never()).save(any(MediaLocation.class));
    }

    @Test
    void createMediaLocation_GeocodedAddressHasDifferentProvince_ThrowsProvinceValidationError() throws Exception {
        Jwt jwt = mock(Jwt.class);
        when(jwt.getSubject()).thenReturn("auth0|123");
        BusinessResponseModel businessModel = new BusinessResponseModel();
        businessModel.setBusinessId(businessId.toString());
        when(businessService.getBusinessByUserId(any(), anyString())).thenReturn(businessModel);

        mediaLocation.setProvince("WrongProvince");
        String geocodingWithAddress = "[{\"lat\":\"10.0\",\"lon\":\"20.0\",\"address\":{\"country\":\"Country\",\"state\":\"Province\",\"city\":\"City\",\"postcode\":\"12345\",\"road\":\"Main St\",\"house_number\":\"123\"}}]";
        when(geocodingService.geocodeAddress(anyString())).thenReturn(Optional.of(geocodingWithAddress));

        JsonNode realRoot = new ObjectMapper().readTree(geocodingWithAddress);
        when(objectMapper.readTree(anyString())).thenReturn(realRoot);

        MediaLocationValidationException exception = assertThrows(MediaLocationValidationException.class,
                () -> mediaLocationService.createMediaLocation(mediaLocation, jwt));

        assertEquals("Address could not be verified. Please verify the province/state.", exception.getMessage());
        assertTrue(exception.getFieldErrors().containsKey("province"));
        assertEquals(1, exception.getFieldErrors().size());
        verify(mediaLocationRepository, never()).save(any(MediaLocation.class));
    }

    @Test
    void createMediaLocation_ValidBilingualAddressConsistency_SavesSuccessfully() throws Exception {
        Jwt jwt = mock(Jwt.class);
        when(jwt.getSubject()).thenReturn("auth0|123");
        BusinessResponseModel businessModel = new BusinessResponseModel();
        businessModel.setBusinessId(businessId.toString());
        when(businessService.getBusinessByUserId(any(), anyString())).thenReturn(businessModel);

        mediaLocation.setStreet("3040 Sherbrooke St W");
        mediaLocation.setCity("Montreal");
        mediaLocation.setProvince("QC");
        mediaLocation.setCountry("Canada");
        mediaLocation.setPostalCode("H3Z 1A4");

        String geocodingWithAddress = "[{\"lat\":\"45.4958\",\"lon\":\"-73.5935\",\"address\":{\"country\":\"Canada\",\"country_code\":\"ca\",\"state\":\"Quebec\",\"ISO3166-2-lvl4\":\"CA-QC\",\"city\":\"Montréal\",\"postcode\":\"H3Z1A4\",\"road\":\"Rue Sherbrooke Ouest\",\"house_number\":\"3040\"}}]";
        when(geocodingService.geocodeAddress(anyString())).thenReturn(Optional.of(geocodingWithAddress));
        when(mediaLocationRepository.save(any(MediaLocation.class))).thenReturn(mediaLocation);

        JsonNode realRoot = new ObjectMapper().readTree(geocodingWithAddress);
        when(objectMapper.readTree(anyString())).thenReturn(realRoot);

        MediaLocation result = mediaLocationService.createMediaLocation(mediaLocation, jwt);

        assertNotNull(result);
        verify(mediaLocationRepository).save(mediaLocation);
    }

    @Test
    void createMediaLocation_WrongCity_PinpointsCityOnly() throws Exception {
        Jwt jwt = mock(Jwt.class);
        when(jwt.getSubject()).thenReturn("auth0|123");
        BusinessResponseModel businessModel = new BusinessResponseModel();
        businessModel.setBusinessId(businessId.toString());
        when(businessService.getBusinessByUserId(any(), anyString())).thenReturn(businessModel);

        mediaLocation.setStreet("4873 Westmount Ave");
        mediaLocation.setCity("Brossard");
        mediaLocation.setProvince("QC");
        mediaLocation.setCountry("Canada");
        mediaLocation.setPostalCode("H3Y 1X9");

        String referenceJson = "[{\"lat\":\"45.4864\",\"lon\":\"-73.5967\",\"address\":{\"country\":\"Canada\",\"country_code\":\"ca\",\"state\":\"Quebec\",\"ISO3166-2-lvl4\":\"CA-QC\",\"city\":\"Westmount\",\"postcode\":\"H3Y1X9\",\"road\":\"Avenue Westmount\",\"house_number\":\"4873\"}}]";
        when(geocodingService.geocodeAddress(anyString())).thenReturn(Optional.empty());
        when(geocodingService.geocodeAddress(eq("H3Y 1X9, Canada"))).thenReturn(Optional.of(referenceJson));

        JsonNode referenceRoot = new ObjectMapper().readTree(referenceJson);
        when(objectMapper.readTree(eq(referenceJson)))
                .thenReturn(referenceRoot);

        MediaLocationValidationException exception = assertThrows(MediaLocationValidationException.class,
                () -> mediaLocationService.createMediaLocation(mediaLocation, jwt));

        assertEquals("Address could not be verified. Please verify the city.", exception.getMessage());
        assertTrue(exception.getFieldErrors().containsKey("city"));
        assertEquals(1, exception.getFieldErrors().size());
        verify(mediaLocationRepository, never()).save(any(MediaLocation.class));
    }

    @Test
    void createMediaLocation_GeocodingUnavailable_ThrowsServiceUnavailableException() {
        Jwt jwt = mock(Jwt.class);
        when(jwt.getSubject()).thenReturn("auth0|123");
        BusinessResponseModel businessModel = new BusinessResponseModel();
        businessModel.setBusinessId(businessId.toString());
        when(businessService.getBusinessByUserId(any(), anyString())).thenReturn(businessModel);

        when(geocodingService.geocodeAddress(anyString()))
                .thenThrow(new GeocodingServiceUnavailableException("Address validation service is temporarily unavailable.",
                        new RuntimeException("timeout")));

        GeocodingServiceUnavailableException exception = assertThrows(GeocodingServiceUnavailableException.class,
                () -> mediaLocationService.createMediaLocation(mediaLocation, jwt));

        assertEquals("Address validation service is temporarily unavailable. Please try again shortly.",
                exception.getMessage());
        verify(mediaLocationRepository, never()).save(any(MediaLocation.class));
    }

    @Test
    void createMediaLocation_InvalidCoordinateFormat_ThrowsExceptionAndDoesNotSave() throws Exception {
        Jwt jwt = mock(Jwt.class);
        when(jwt.getSubject()).thenReturn("auth0|123");
        BusinessResponseModel businessModel = new BusinessResponseModel();
        businessModel.setBusinessId(businessId.toString());
        when(businessService.getBusinessByUserId(any(), anyString())).thenReturn(businessModel);

        when(geocodingService.geocodeAddress(anyString())).thenReturn(Optional.of(geocodingJson));

        JsonNode rootNode = mock(JsonNode.class);
        JsonNode firstResult = mock(JsonNode.class);
        JsonNode latNode = mock(JsonNode.class);

        when(objectMapper.readTree(anyString())).thenReturn(rootNode);
        when(rootNode.isArray()).thenReturn(true);
        when(rootNode.size()).thenReturn(1);
        when(rootNode.get(0)).thenReturn(firstResult);
        when(firstResult.has("lat")).thenReturn(true);
        when(firstResult.has("lon")).thenReturn(true);
        when(firstResult.get("lat")).thenReturn(latNode);
        when(latNode.asText()).thenReturn("invalid-lat");

        MediaLocationValidationException exception = assertThrows(MediaLocationValidationException.class,
                () -> mediaLocationService.createMediaLocation(mediaLocation, jwt));

        assertEquals(
                "Address was matched but coordinates could not be determined. Please check street, city, province/state, country, and postal code.",
                exception.getMessage());
        assertTrue(exception.getFieldErrors().containsKey("street"));
        assertTrue(exception.getFieldErrors().containsKey("city"));
        assertTrue(exception.getFieldErrors().containsKey("province"));
        assertTrue(exception.getFieldErrors().containsKey("country"));
        assertTrue(exception.getFieldErrors().containsKey("postalCode"));
        verify(mediaLocationRepository, never()).save(any(MediaLocation.class));
    }

    @Test
    void createMediaLocation_MissingPostalCode_ThrowsValidationException() {
        Jwt jwt = mock(Jwt.class);
        when(jwt.getSubject()).thenReturn("auth0|123");
        BusinessResponseModel businessModel = new BusinessResponseModel();
        businessModel.setBusinessId(businessId.toString());
        when(businessService.getBusinessByUserId(any(), anyString())).thenReturn(businessModel);
        mediaLocation.setPostalCode("   ");

        MediaLocationValidationException exception = assertThrows(MediaLocationValidationException.class,
                () -> mediaLocationService.createMediaLocation(mediaLocation, jwt));

        assertEquals("Please provide a valid address including street, city, province/state, country, and postal code.",
                exception.getMessage());
        assertEquals("Postal code is required.", exception.getFieldErrors().get("postalCode"));
        verify(mediaLocationRepository, never()).save(any(MediaLocation.class));
        verify(geocodingService, never()).geocodeAddress(anyString());
    }
}
