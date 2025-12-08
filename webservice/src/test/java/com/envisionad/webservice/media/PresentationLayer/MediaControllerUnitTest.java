package com.envisionad.webservice.media.PresentationLayer;

import com.envisionad.webservice.media.BusinessLayer.MediaService;
import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.DataAccessLayer.Status;
import com.envisionad.webservice.media.DataAccessLayer.TypeOfDisplay;
import com.envisionad.webservice.media.MapperLayer.MediaRequestMapper;
import com.envisionad.webservice.media.MapperLayer.MediaResponseMapper;
import com.envisionad.webservice.media.PresentationLayer.Models.MediaRequestModel;
import com.envisionad.webservice.media.PresentationLayer.Models.MediaResponseModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest(classes = MediaController.class)
class MediaControllerUnitTest {

    @MockitoBean
    private MediaService mediaService;

    @MockitoBean
    private MediaRequestMapper requestMapper;

    @MockitoBean
    private MediaResponseMapper responseMapper;

    @Autowired
    private MediaController mediaController;

    private Media media;
    private MediaResponseModel responseModel;
    private MediaRequestModel requestModel;
    private final String mediaId = UUID.randomUUID().toString();

    @BeforeEach
    void setUp() {
        media = new Media();
        media.setId(mediaId);
        media.setTitle("Test Media");
        media.setMediaOwnerName("Owner");
        media.setAddress("123 Test St");
        media.setTypeOfDisplay(TypeOfDisplay.DIGITAL);
        media.setPrice(new BigDecimal("100.00"));
        media.setStatus(Status.ACTIVE);

        responseModel = new MediaResponseModel();
        responseModel.setId(mediaId);
        responseModel.setTitle("Test Media");
        responseModel.setMediaOwnerName("Owner");
        responseModel.setAddress("123 Test St");
        responseModel.setTypeOfDisplay(TypeOfDisplay.DIGITAL);
        responseModel.setPrice(new BigDecimal("100.00"));
        responseModel.setStatus(Status.ACTIVE);

        requestModel = new MediaRequestModel();
        requestModel.setTitle("Test Media");
        requestModel.setMediaOwnerName("Owner");
        requestModel.setAddress("123 Test St");
        requestModel.setTypeOfDisplay(TypeOfDisplay.DIGITAL);
        requestModel.setPrice(new BigDecimal("100.00"));
        requestModel.setStatus(Status.ACTIVE);
    }

    @Test
    void getAllMedia_ShouldReturnListOfMedia() {
        List<Media> mediaList = Arrays.asList(media);
        List<MediaResponseModel> responseList = Arrays.asList(responseModel);

        when(mediaService.getAllMedia()).thenReturn(mediaList);
        when(responseMapper.entityListToResponseModelList(mediaList)).thenReturn(responseList);

        List<MediaResponseModel> response = mediaController.getAllMedia();

        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals(mediaId, response.get(0).getId());
        assertEquals("Test Media", response.get(0).getTitle());
        verify(mediaService, times(1)).getAllMedia();
        verify(responseMapper, times(1)).entityListToResponseModelList(mediaList);
    }

    @Test
    void getAllFilteredActiveMedia_NoFilters_ShouldReturnList() {
        List<Media> mediaList = List.of(media);
        List<MediaResponseModel> responseList = List.of(responseModel);

        when(mediaService.getAllFilteredActiveMedia(null, null, null, null))
                .thenReturn(mediaList);
        when(responseMapper.entityListToResponseModelList(mediaList))
                .thenReturn(responseList);

        ResponseEntity<?> response =
                mediaController.getAllFilteredActiveMedia(null, null, null, null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(responseList, response.getBody());

        verify(mediaService).getAllFilteredActiveMedia(null, null, null, null);
    }


    @Test
    void getAllFilteredActiveMedia_TitleOnly_ShouldReturnFiltered() {
        List<Media> mediaList = List.of(media);
        List<MediaResponseModel> responseList = List.of(responseModel);

        when(mediaService.getAllFilteredActiveMedia("Test", null, null, null))
                .thenReturn(mediaList);
        when(responseMapper.entityListToResponseModelList(mediaList))
                .thenReturn(responseList);

        ResponseEntity<?> response =
                mediaController.getAllFilteredActiveMedia("Test", null, null, null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(responseList, response.getBody());

        verify(mediaService).getAllFilteredActiveMedia("Test", null, null, null);
    }

    @Test
    void getAllFilteredActiveMedia_MultipleFilters_ShouldReturnFiltered() {
        List<Media> mediaList = List.of(media);
        List<MediaResponseModel> responseList = List.of(responseModel);

        when(mediaService.getAllFilteredActiveMedia(
                "Billboard",
                BigDecimal.valueOf(50),
                BigDecimal.valueOf(200),
                1000))
                .thenReturn(mediaList);

        when(responseMapper.entityListToResponseModelList(mediaList))
                .thenReturn(responseList);

        ResponseEntity<?> response =
                mediaController.getAllFilteredActiveMedia(
                        "Billboard",
                        BigDecimal.valueOf(50),
                        BigDecimal.valueOf(200),
                        1000
                );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(responseList, response.getBody());

        verify(mediaService).getAllFilteredActiveMedia(
                "Billboard",
                BigDecimal.valueOf(50),
                BigDecimal.valueOf(200),
                1000
        );
    }

    @Test
    void getAllFilteredActiveMedia_NoResults_ShouldReturnEmptyList() {
        when(mediaService.getAllFilteredActiveMedia("NoMatch", null, null, null))
                .thenReturn(List.of());

        when(responseMapper.entityListToResponseModelList(List.of()))
                .thenReturn(List.of());

        ResponseEntity<?> response =
                mediaController.getAllFilteredActiveMedia("NoMatch", null, null, null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        List<?> body = (List<?>) response.getBody();
        assertTrue(body.isEmpty());

        verify(mediaService).getAllFilteredActiveMedia("NoMatch", null, null, null);
    }


    @Test
    void getAllFilteredActiveMedia_MinPriceNegative_ShouldReturnBadRequest() {
        ResponseEntity<?> response =
                mediaController.getAllFilteredActiveMedia(null, BigDecimal.valueOf(-1), null, null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("minPrice must be non-negative.", response.getBody());

        verifyNoInteractions(mediaService);
    }

    @Test
    void getAllFilteredActiveMedia_MaxPriceNegative_ShouldReturnBadRequest() {
        ResponseEntity<?> response =
                mediaController.getAllFilteredActiveMedia(null, null, BigDecimal.valueOf(-5), null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("maxPrice must be non-negative.", response.getBody());

        verifyNoInteractions(mediaService);
    }


    @Test
    void getAllFilteredActiveMedia_MinGreaterThanMax_ShouldReturnBadRequest() {
        ResponseEntity<?> response =
                mediaController.getAllFilteredActiveMedia(
                        null,
                        BigDecimal.valueOf(50),
                        BigDecimal.valueOf(10),
                        null
                );

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("minPrice must not be greater than maxPrice.", response.getBody());

        verifyNoInteractions(mediaService);
    }

    @Test
    void getAllFilteredActiveMedia_MinDailyImpressionsNegative_ShouldReturnBadRequest() {
        ResponseEntity<?> response =
                mediaController.getAllFilteredActiveMedia(null, null, null, -10);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("minDailyImpressions must be non-negative.", response.getBody());

        verifyNoInteractions(mediaService);
    }



    @Test
    void getMediaById_WhenFound_ShouldReturnMedia() {
        when(mediaService.getMediaById(mediaId)).thenReturn(media);
        when(responseMapper.entityToResponseModel(media)).thenReturn(responseModel);

        ResponseEntity<MediaResponseModel> response = mediaController.getMediaById(mediaId);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(mediaId, response.getBody().getId());
        verify(mediaService, times(1)).getMediaById(mediaId);
        verify(responseMapper, times(1)).entityToResponseModel(media);
    }

    @Test
    void getMediaById_WhenNotFound_ShouldReturn404() {
        when(mediaService.getMediaById(mediaId)).thenReturn(null);

        ResponseEntity<MediaResponseModel> response = mediaController.getMediaById(mediaId);

        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNull(response.getBody());
        verify(mediaService, times(1)).getMediaById(mediaId);
    }

    @Test
    void addMedia_ShouldReturnCreatedMedia() {
        when(requestMapper.requestModelToEntity(any(MediaRequestModel.class))).thenReturn(media);
        when(mediaService.addMedia(any(Media.class))).thenReturn(media);
        when(responseMapper.entityToResponseModel(any(Media.class))).thenReturn(responseModel);

        ResponseEntity<MediaResponseModel> response = mediaController.addMedia(requestModel);

        assertNotNull(response);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(mediaId, response.getBody().getId());
        verify(requestMapper, times(1)).requestModelToEntity(any(MediaRequestModel.class));
        verify(mediaService, times(1)).addMedia(any(Media.class));
        verify(responseMapper, times(1)).entityToResponseModel(any(Media.class));
    }

    @Test
    void updateMedia_ShouldReturnUpdatedMedia() {
        when(requestMapper.requestModelToEntity(any(MediaRequestModel.class))).thenReturn(media);
        when(mediaService.updateMedia(any(Media.class))).thenReturn(media);
        when(responseMapper.entityToResponseModel(any(Media.class))).thenReturn(responseModel);

        ResponseEntity<MediaResponseModel> response = mediaController.updateMedia(mediaId, requestModel);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(mediaId, response.getBody().getId());
        verify(requestMapper, times(1)).requestModelToEntity(any(MediaRequestModel.class));
        verify(mediaService, times(1)).updateMedia(any(Media.class));
        verify(responseMapper, times(1)).entityToResponseModel(any(Media.class));
    }

    @Test
    void deleteMedia_ShouldReturnNoContent() {
        ResponseEntity<Void> response = mediaController.deleteMedia(mediaId);

        assertNotNull(response);
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        assertNull(response.getBody());
        verify(mediaService, times(1)).deleteMedia(mediaId);
    }

    @Test
    void uploadImage_WhenMediaExists_ShouldReturnCreated() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.jpg", MediaType.IMAGE_JPEG_VALUE, "test image content".getBytes());

        when(mediaService.getMediaById(mediaId)).thenReturn(media);
        when(mediaService.updateMedia(any(Media.class))).thenReturn(media);

        ResponseEntity<?> response = mediaController.uploadImage(mediaId, file);

        assertNotNull(response);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        verify(mediaService, times(1)).getMediaById(mediaId);
        verify(mediaService, times(1)).updateMedia(any(Media.class));
    }

    @Test
    void uploadImage_WhenMediaNotFound_ShouldReturnNotFound() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.jpg", MediaType.IMAGE_JPEG_VALUE, "test image content".getBytes());

        when(mediaService.getMediaById(mediaId)).thenReturn(null);

        ResponseEntity<?> response = mediaController.uploadImage(mediaId, file);

        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(mediaService, times(1)).getMediaById(mediaId);
        verify(mediaService, never()).updateMedia(any(Media.class));
    }

    @Test
    void getImage_WhenMediaAndImageExist_ShouldReturnImage() {
        media.setImageData("test image content".getBytes());
        media.setImageContentType(MediaType.IMAGE_JPEG_VALUE);

        when(mediaService.getMediaById(mediaId)).thenReturn(media);

        ResponseEntity<byte[]> response = mediaController.getImage(mediaId);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertArrayEquals("test image content".getBytes(), response.getBody());
        assertEquals(MediaType.IMAGE_JPEG, response.getHeaders().getContentType());
        verify(mediaService, times(1)).getMediaById(mediaId);
    }

    @Test
    void getImage_WhenMediaNotFound_ShouldReturnNotFound() {
        when(mediaService.getMediaById(mediaId)).thenReturn(null);

        ResponseEntity<byte[]> response = mediaController.getImage(mediaId);

        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(mediaService, times(1)).getMediaById(mediaId);
    }
}