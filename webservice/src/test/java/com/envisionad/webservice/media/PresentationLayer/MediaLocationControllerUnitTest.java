package com.envisionad.webservice.media.PresentationLayer;

import com.envisionad.webservice.media.BusinessLayer.MediaLocationService;
import com.envisionad.webservice.media.DataAccessLayer.MediaLocation;
import com.envisionad.webservice.media.MapperLayer.MediaLocationRequestMapper;
import com.envisionad.webservice.media.MapperLayer.MediaLocationResponseMapper;
import com.envisionad.webservice.media.PresentationLayer.Models.MediaLocationRequestModel;
import com.envisionad.webservice.media.PresentationLayer.Models.MediaLocationResponseModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest(classes = MediaLocationController.class)
class MediaLocationControllerUnitTest {

    @MockitoBean
    private MediaLocationService mediaLocationService;

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
    void deleteMediaLocation_ShouldReturnNoContent() {
        ResponseEntity<Void> response = mediaLocationController.deleteMediaLocation(mediaLocationId.toString());

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(mediaLocationService).deleteMediaLocation(mediaLocationId);
    }

    @Test
    void getMediaLocationById_WhenFound_ShouldReturnLocation() {
        when(mediaLocationService.getMediaLocationById(mediaLocationId)).thenReturn(mediaLocation);
        when(responseMapper.entityToResponseModel(mediaLocation)).thenReturn(responseModel);

        ResponseEntity<MediaLocationResponseModel> response = mediaLocationController
                .getMediaLocationById(mediaLocationId.toString());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(mediaLocationId, response.getBody().getId());
    }

    @Test
    void getMediaLocationById_WhenNotFound_ShouldReturn404() {
        when(mediaLocationService.getMediaLocationById(mediaLocationId)).thenReturn(null);

        ResponseEntity<MediaLocationResponseModel> response = mediaLocationController
                .getMediaLocationById(mediaLocationId.toString());

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    // Removed assignMediaToLocation tests and unassignMediaFromLocation tests as
    // requested

    @Test
    void updateMediaLocation_ShouldUpdateFields() {
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

        when(requestMapper.requestModelToEntity(any(MediaLocationRequestModel.class))).thenReturn(updatedEntity);
        // Updated mock to match new service signature
        when(mediaLocationService.updateMediaLocation(eq(mediaLocationId), any(MediaLocation.class)))
                .thenReturn(updatedEntity);
        when(responseMapper.entityToResponseModel(any(MediaLocation.class))).thenReturn(responseModel);

        ResponseEntity<MediaLocationResponseModel> response = mediaLocationController.updateMediaLocation(
                mediaLocationId.toString(), updateRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        // Verify call with correct arguments
        verify(mediaLocationService).updateMediaLocation(eq(mediaLocationId), any(MediaLocation.class));
    }
}
