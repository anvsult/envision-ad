package com.envisionad.webservice.media.PresentationLayer;

import com.envisionad.webservice.business.businesslogiclayer.BusinessService;
import com.envisionad.webservice.business.presentationlayer.models.BusinessResponseModel;
import com.envisionad.webservice.media.BusinessLayer.MediaLocationService;
import com.envisionad.webservice.media.DataAccessLayer.MediaLocation;
import com.envisionad.webservice.media.MapperLayer.MediaLocationRequestMapper;
import com.envisionad.webservice.media.MapperLayer.MediaLocationResponseMapper;
import com.envisionad.webservice.media.PresentationLayer.Models.MediaLocationRequestModel;
import com.envisionad.webservice.media.PresentationLayer.Models.MediaLocationResponseModel;
import com.envisionad.webservice.media.exceptions.MediaLocationValidationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest(classes = MediaLocationController.class)
class MediaLocationControllerUnitTest {

    @MockitoBean
    private MediaLocationService mediaLocationService;
    @MockitoBean
    private BusinessService businessService;

    @MockitoBean
    private MediaLocationRequestMapper requestMapper;

    @MockitoBean
    private MediaLocationResponseMapper responseMapper;

    @Autowired
    private MediaLocationController mediaLocationController;

    private MediaLocation mediaLocation;
    private MediaLocationResponseModel responseModel;
    private MediaLocationRequestModel requestModel;
    private final UUID mediaLocationId = UUID.randomUUID();
    private final String businessId = UUID.randomUUID().toString();

    @BeforeEach
    void setUp() {
        mediaLocation = new MediaLocation();
        mediaLocation.setId(mediaLocationId);
        mediaLocation.setName("Test Location");
        mediaLocation.setBusinessId(UUID.fromString(businessId));

        responseModel = new MediaLocationResponseModel();
        responseModel.setId(mediaLocationId);
        responseModel.setName("Test Location");

        requestModel = new MediaLocationRequestModel();
        requestModel.setName("Test Location");
    }

    @Test
    void createMediaLocation_ShouldReturnCreated() {
        Jwt jwt = mock(Jwt.class);
        when(jwt.getSubject()).thenReturn("auth0|123");

        when(requestMapper.requestModelToEntity(any(MediaLocationRequestModel.class))).thenReturn(mediaLocation);
        when(mediaLocationService.createMediaLocation(any(MediaLocation.class), any(Jwt.class)))
                .thenReturn(mediaLocation);
        when(responseMapper.entityToResponseModel(any(MediaLocation.class))).thenReturn(responseModel);

        ResponseEntity<MediaLocationResponseModel> response = mediaLocationController.createMediaLocation(jwt,
                requestModel);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        verify(mediaLocationService).createMediaLocation(any(MediaLocation.class), any(Jwt.class));
    }

    @Test
    void getAllMediaLocations_WhenValid_ShouldReturnOk() {
        Jwt jwt = mock(Jwt.class);
        when(jwt.getSubject()).thenReturn("auth0|123");

        when(mediaLocationService.getAllMediaLocations(jwt, businessId)).thenReturn(List.of(mediaLocation));
        when(responseMapper.entityListToResponseModelList(any())).thenReturn(List.of(responseModel));

        ResponseEntity<List<MediaLocationResponseModel>> response = mediaLocationController.getAllMediaLocations(jwt,
                businessId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        verify(mediaLocationService).getAllMediaLocations(jwt, businessId);
        verify(responseMapper).entityListToResponseModelList(any());
    }

    @Test
    void getAllMediaLocations_WhenBusinessIdInvalid_ShouldReturnBadRequest() {
        Jwt jwt = mock(Jwt.class);
        when(jwt.getSubject()).thenReturn("auth0|123");

        when(mediaLocationService.getAllMediaLocations(jwt, businessId))
                .thenThrow(new IllegalArgumentException("Business ID is required"));

        ResponseEntity<List<MediaLocationResponseModel>> response = mediaLocationController.getAllMediaLocations(jwt,
                businessId);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(mediaLocationService).getAllMediaLocations(jwt, businessId);
        verify(responseMapper, never()).entityListToResponseModelList(any());
    }

    @Test
    void deleteMediaLocation_ShouldReturnNoContent() {
        Jwt jwt = mock(Jwt.class);
        when(jwt.getSubject()).thenReturn("auth0|123");
        BusinessResponseModel businessResponseModel = new BusinessResponseModel();
        businessResponseModel.setBusinessId(businessId);
        when(businessService.getBusinessByUserId(jwt, "auth0|123")).thenReturn(businessResponseModel);
        when(mediaLocationService.getMediaLocationById(mediaLocationId)).thenReturn(mediaLocation);

        ResponseEntity<Void> response = mediaLocationController.deleteMediaLocation(jwt, mediaLocationId.toString());

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(mediaLocationService).getMediaLocationById(mediaLocationId);
        verify(mediaLocationService).deleteMediaLocation(mediaLocationId);
    }

    @Test
    void getMediaLocationById_WhenFound_ShouldReturnLocation() {
        Jwt jwt = mock(Jwt.class);
        when(jwt.getSubject()).thenReturn("auth0|123");
        BusinessResponseModel businessResponseModel = new BusinessResponseModel();
        businessResponseModel.setBusinessId(businessId);
        when(businessService.getBusinessByUserId(jwt, "auth0|123")).thenReturn(businessResponseModel);
        when(mediaLocationService.getMediaLocationById(mediaLocationId)).thenReturn(mediaLocation);
        when(responseMapper.entityToResponseModel(mediaLocation)).thenReturn(responseModel);

        ResponseEntity<MediaLocationResponseModel> response = mediaLocationController
                .getMediaLocationById(jwt, mediaLocationId.toString());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(mediaLocationId, response.getBody().getId());
    }

    @Test
    void getMediaLocationById_WhenNotFound_ShouldReturn404() {
        when(mediaLocationService.getMediaLocationById(mediaLocationId)).thenReturn(null);

        ResponseEntity<MediaLocationResponseModel> response = mediaLocationController
                .getMediaLocationById(null, mediaLocationId.toString());

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void getMediaLocationById_WhenBusinessDoesNotMatch_ShouldReturn403() {
        Jwt jwt = mock(Jwt.class);
        when(jwt.getSubject()).thenReturn("auth0|123");
        BusinessResponseModel businessResponseModel = new BusinessResponseModel();
        businessResponseModel.setBusinessId(UUID.randomUUID().toString());
        when(businessService.getBusinessByUserId(jwt, "auth0|123")).thenReturn(businessResponseModel);
        when(mediaLocationService.getMediaLocationById(mediaLocationId)).thenReturn(mediaLocation);

        ResponseEntity<MediaLocationResponseModel> response = mediaLocationController
                .getMediaLocationById(jwt, mediaLocationId.toString());

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        verify(responseMapper, never()).entityToResponseModel(any(MediaLocation.class));
    }

    // Removed assignMediaToLocation tests and unassignMediaFromLocation tests as
    // requested

    @Test
    void updateMediaLocation_ShouldUpdateFields() {
        Jwt jwt = mock(Jwt.class);
        when(jwt.getSubject()).thenReturn("auth0|123");
        BusinessResponseModel businessResponseModel = new BusinessResponseModel();
        businessResponseModel.setBusinessId(businessId);
        when(businessService.getBusinessByUserId(jwt, "auth0|123")).thenReturn(businessResponseModel);

        MediaLocationRequestModel updateRequest = new MediaLocationRequestModel();
        updateRequest.setName("New Name");
        updateRequest.setLatitude(10.0);
        updateRequest.setLongitude(20.0);

        MediaLocation updatedEntity = new MediaLocation();
        updatedEntity.setId(mediaLocationId);
        updatedEntity.setBusinessId(UUID.fromString(businessId));
        updatedEntity.setName("New Name");
        updatedEntity.setLatitude(10.0);
        updatedEntity.setLongitude(20.0);

        when(mediaLocationService.getMediaLocationById(mediaLocationId)).thenReturn(mediaLocation);
        when(requestMapper.requestModelToEntity(any(MediaLocationRequestModel.class))).thenReturn(updatedEntity);
        // Updated mock to match new service signature
        when(mediaLocationService.updateMediaLocation(eq(mediaLocationId), any(MediaLocation.class)))
                .thenReturn(updatedEntity);
        when(responseMapper.entityToResponseModel(any(MediaLocation.class))).thenReturn(responseModel);

        ResponseEntity<MediaLocationResponseModel> response = mediaLocationController.updateMediaLocation(
                jwt, mediaLocationId.toString(), updateRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        // Verify call with correct arguments
        verify(mediaLocationService).updateMediaLocation(eq(mediaLocationId), any(MediaLocation.class));
    }

    @Test
    void updateMediaLocation_WhenBusinessDoesNotMatch_ShouldReturn403() {
        Jwt jwt = mock(Jwt.class);
        when(jwt.getSubject()).thenReturn("auth0|123");
        BusinessResponseModel businessResponseModel = new BusinessResponseModel();
        businessResponseModel.setBusinessId(UUID.randomUUID().toString());
        when(businessService.getBusinessByUserId(jwt, "auth0|123")).thenReturn(businessResponseModel);
        when(mediaLocationService.getMediaLocationById(mediaLocationId)).thenReturn(mediaLocation);

        MediaLocationRequestModel updateRequest = new MediaLocationRequestModel();
        updateRequest.setName("New Name");

        ResponseEntity<MediaLocationResponseModel> response = mediaLocationController.updateMediaLocation(
                jwt, mediaLocationId.toString(), updateRequest);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        verify(mediaLocationService, never()).updateMediaLocation(any(UUID.class), any(MediaLocation.class));
    }

    @Test
    void updateMediaLocation_InvalidAddress_ShouldReturnBadRequest() {
        Jwt jwt = mock(Jwt.class);
        when(jwt.getSubject()).thenReturn("auth0|123");
        BusinessResponseModel businessResponseModel = new BusinessResponseModel();
        businessResponseModel.setBusinessId(businessId);
        when(businessService.getBusinessByUserId(jwt, "auth0|123")).thenReturn(businessResponseModel);

        MediaLocationRequestModel updateRequest = new MediaLocationRequestModel();
        updateRequest.setName("New Name");

        MediaLocation mediaLocation = new MediaLocation();
        mediaLocation.setId(mediaLocationId);
        java.util.Map<String, String> fieldErrors = java.util.Map.of("street", "Verify the street name or number.");

        when(mediaLocationService.getMediaLocationById(mediaLocationId)).thenReturn(this.mediaLocation);
        when(requestMapper.requestModelToEntity(any(MediaLocationRequestModel.class))).thenReturn(mediaLocation);
        when(mediaLocationService.updateMediaLocation(eq(mediaLocationId), any(MediaLocation.class)))
                .thenThrow(new MediaLocationValidationException("Please verify street, city, province/state, and country.",
                        fieldErrors));

        assertThrows(MediaLocationValidationException.class, () -> mediaLocationController.updateMediaLocation(
                jwt, mediaLocationId.toString(), updateRequest));
    }

    @Test
    void deleteMediaLocation_WhenBusinessDoesNotMatch_ShouldReturn403() {
        Jwt jwt = mock(Jwt.class);
        when(jwt.getSubject()).thenReturn("auth0|123");
        BusinessResponseModel businessResponseModel = new BusinessResponseModel();
        businessResponseModel.setBusinessId(UUID.randomUUID().toString());
        when(businessService.getBusinessByUserId(jwt, "auth0|123")).thenReturn(businessResponseModel);
        when(mediaLocationService.getMediaLocationById(mediaLocationId)).thenReturn(mediaLocation);

        ResponseEntity<Void> response = mediaLocationController.deleteMediaLocation(jwt, mediaLocationId.toString());

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        verify(mediaLocationService, never()).deleteMediaLocation(any(UUID.class));
    }
}
