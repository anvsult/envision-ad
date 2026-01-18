package com.envisionad.webservice.media.MapperLayer;

import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.DataAccessLayer.MediaLocation;
import com.envisionad.webservice.media.PresentationLayer.Models.MediaResponseModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class MediaResponseMapperTest {

    private MediaResponseMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new MediaResponseMapper();
    }

    @Test
    void entityToResponseModel_WithBusinessId_ShouldMapBusinessId() {
        // Arrange
        UUID businessId = UUID.randomUUID();
        Media media = new Media();
        media.setId(UUID.randomUUID());
        media.setBusinessId(businessId);

        // Act
        MediaResponseModel response = mapper.entityToResponseModel(media);

        // Assert
        assertNotNull(response);
        assertEquals(businessId.toString(), response.getBusinessId());
    }

    @Test
    void entityToResponseModel_WithImageUrl_ShouldMapImageUrl() {
        // Arrange
        String imageUrl = "http://example.com/image.jpg";
        Media media = new Media();
        media.setImageUrl(imageUrl);
        media.setId(UUID.randomUUID());

        // Act
        MediaResponseModel response = mapper.entityToResponseModel(media);

        // Assert
        assertNotNull(response);
        assertEquals(imageUrl, response.getImageUrl());
    }


    @Test
    void entityToResponseModel_WithMediaLocation_ShouldMapLocation() {
        // Arrange
        UUID locationId = UUID.randomUUID();
        MediaLocation location = new MediaLocation();
        location.setId(locationId);
        location.setName("Test Location");

        Media media = new Media();
        media.setId(UUID.randomUUID());
        media.setMediaLocation(location);

        // Act
        MediaResponseModel response = mapper.entityToResponseModel(media);

        // Assert
        assertNotNull(response);
        assertNotNull(response.getMediaLocation());
        assertEquals(locationId, response.getMediaLocation().getId());
        assertEquals("Test Location", response.getMediaLocation().getName());
    }

    @Test
    void entityToResponseModel_WithPreviewConfiguration_ShouldMapPreviewConfiguration() {
        // Arrange
        String previewConfig = "{\"corners\": []}";
        Media media = new Media();
        media.setPreviewConfiguration(previewConfig);

        // Act
        MediaResponseModel response = mapper.entityToResponseModel(media);

        // Assert
        assertNotNull(response);
        assertEquals(previewConfig, response.getPreviewConfiguration());
    }

    @Test
    void entityToResponseModel_WithNullPreviewConfiguration_ShouldMapNull() {
        // Arrange
        Media media = new Media();
        media.setPreviewConfiguration(null);

        // Act
        MediaResponseModel response = mapper.entityToResponseModel(media);

        // Assert
        assertNotNull(response);
        assertNull(response.getPreviewConfiguration());
    }
}
