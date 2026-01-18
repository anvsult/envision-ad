package com.envisionad.webservice.media.MapperLayer;

import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.DataAccessLayer.MediaLocation;
import com.envisionad.webservice.media.DataAccessLayer.MediaLocationRepository;
import com.envisionad.webservice.media.PresentationLayer.Models.MediaRequestModel;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MediaRequestMapperTest {

    @Mock
    private MediaLocationRepository mediaLocationRepository;

    @InjectMocks
    private MediaRequestMapper mediaRequestMapper;

    @Test
    void requestModelToEntity_WithBusinessId_ShouldMapBusinessId() {
        // Arrange
        String businessId = UUID.randomUUID().toString();
        MediaRequestModel requestModel = new MediaRequestModel();
        requestModel.setBusinessId(businessId);

        // Act
        Media media = mediaRequestMapper.requestModelToEntity(requestModel);

        // Assert
        assertNotNull(media);
        assertEquals(UUID.fromString(businessId), media.getBusinessId());
    }

    @Test
    void requestModelToEntity_WithNullBusinessId_ShouldMapNull() {
        // Arrange
        MediaRequestModel requestModel = new MediaRequestModel();
        requestModel.setBusinessId(null);

        // Act
        Media media = mediaRequestMapper.requestModelToEntity(requestModel);

        // Assert
        assertNotNull(media);
        assertNull(media.getBusinessId());
    }

    @Test
    void requestModelToEntity_WithMediaLocationId_ShouldMapMediaLocation() {
        // Arrange
        UUID locationId = UUID.randomUUID();
        MediaLocation location = new MediaLocation();
        location.setId(locationId);

        MediaRequestModel requestModel = new MediaRequestModel();
        requestModel.setMediaLocationId(locationId.toString());

        when(mediaLocationRepository.findById(locationId)).thenReturn(Optional.of(location));

        // Act
        Media media = mediaRequestMapper.requestModelToEntity(requestModel);

        // Assert
        assertNotNull(media);
        assertEquals(location, media.getMediaLocation());
    }

    @Test
    void requestModelToEntity_WithInvalidMediaLocationId_ShouldThrowException() {
        // Arrange
        UUID locationId = UUID.randomUUID();
        MediaRequestModel requestModel = new MediaRequestModel();
        requestModel.setMediaLocationId(locationId.toString());

        when(mediaLocationRepository.findById(locationId)).thenReturn(Optional.empty());

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> mediaRequestMapper.requestModelToEntity(requestModel));
        assertEquals("Invalid mediaLocationId", exception.getMessage());
    }

    @Test
    void requestModelToEntity_WithImageUrl_ShouldMapImageUrl() {
        // Arrange
        String imageUrl = "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg";
        MediaRequestModel requestModel = new MediaRequestModel();
        requestModel.setImageUrl(imageUrl);

        // Act
        Media media = mediaRequestMapper.requestModelToEntity(requestModel);

        // Assert
        assertNotNull(media);
        assertEquals(imageUrl, media.getImageUrl());
    }

    @Test
    void requestModelToEntity_WithPreviewConfiguration_ShouldMapPreviewConfiguration() {
        // Arrange
        String previewConfig = "{\"corners\": []}";
        MediaRequestModel requestModel = new MediaRequestModel();
        requestModel.setPreviewConfiguration(previewConfig);

        // Act
        Media media = mediaRequestMapper.requestModelToEntity(requestModel);

        // Assert
        assertNotNull(media);
        assertEquals(previewConfig, media.getPreviewConfiguration());
    }
}
