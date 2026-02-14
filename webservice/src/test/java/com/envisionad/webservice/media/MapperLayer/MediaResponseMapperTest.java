package com.envisionad.webservice.media.MapperLayer;

import com.envisionad.webservice.business.dataaccesslayer.BusinessRepository;
import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.DataAccessLayer.MediaLocation;
import com.envisionad.webservice.media.PresentationLayer.Models.MediaResponseModel;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class MediaResponseMapperTest {

    private MediaResponseMapper mapper;
    private BusinessRepository businessRepository;

    @BeforeEach
    void setUp() {
        businessRepository = Mockito.mock(BusinessRepository.class);
        mapper = new MediaResponseMapper(businessRepository);
    }

    @Test
    void entityToResponseModel_WithBusinessId_ShouldMapBusinessId() {
        UUID businessId = UUID.randomUUID();

        Media media = new Media();
        media.setId(UUID.randomUUID());
        media.setBusinessId(businessId);

        MediaResponseModel response = mapper.entityToResponseModel(media);

        assertNotNull(response);
        assertEquals(businessId.toString(), response.getBusinessId());
    }

    @Test
    void entityToResponseModel_WithImageUrl_ShouldMapImageUrl() {
        String imageUrl = "http://example.com/image.jpg";

        Media media = new Media();
        media.setImageUrl(imageUrl);
        media.setId(UUID.randomUUID());

        MediaResponseModel response = mapper.entityToResponseModel(media);

        assertNotNull(response);
        assertEquals(imageUrl, response.getImageUrl());
    }

    @Test
    void entityToResponseModel_WithMediaLocation_ShouldMapLocation() {
        UUID locationId = UUID.randomUUID();

        MediaLocation location = new MediaLocation();
        location.setId(locationId);
        location.setName("Test Location");

        Media media = new Media();
        media.setId(UUID.randomUUID());
        media.setMediaLocation(location);

        MediaResponseModel response = mapper.entityToResponseModel(media);

        assertNotNull(response);
        assertNotNull(response.getMediaLocation());
        assertEquals(locationId, response.getMediaLocation().getId());
        assertEquals("Test Location", response.getMediaLocation().getName());
    }

    @Test
    void entityToResponseModel_WithPreviewConfiguration_ShouldMapPreviewConfiguration() {
        String previewConfig = "{\"corners\": []}";

        Media media = new Media();
        media.setPreviewConfiguration(previewConfig);

        MediaResponseModel response = mapper.entityToResponseModel(media);

        assertNotNull(response);
        assertEquals(previewConfig, response.getPreviewConfiguration());
    }

    @Test
    void entityToResponseModel_WithNullPreviewConfiguration_ShouldMapNull() {
        Media media = new Media();
        media.setPreviewConfiguration(null);

        MediaResponseModel response = mapper.entityToResponseModel(media);

        assertNotNull(response);
        assertNull(response.getPreviewConfiguration());
    }
}
