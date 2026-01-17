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
    void entityToResponseModel_WithImageDataAndNoImageUrl_ShouldMapImageUrlFromId() {
        // Arrange
        UUID mediaId = UUID.randomUUID();
        byte[] imageData = new byte[] { 1, 2, 3 };
        Media media = new Media();
        media.setId(mediaId);
        media.setImageData(imageData);
        media.setImageUrl(null); // Ensure imageUrl is null

        // Act
        MediaResponseModel response = mapper.entityToResponseModel(media);

        // Assert
        assertNotNull(response);
        assertEquals("/api/v1/media/" + mediaId + "/image", response.getImageUrl());
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
}
