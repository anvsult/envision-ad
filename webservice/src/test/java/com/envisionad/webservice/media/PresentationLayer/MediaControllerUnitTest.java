package com.envisionad.webservice.media.PresentationLayer;

import com.envisionad.webservice.media.BusinessLayer.MediaService;
import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.DataAccessLayer.Status;
import com.envisionad.webservice.media.DataAccessLayer.TypeOfDisplay;
import com.envisionad.webservice.media.MapperLayer.MediaRequestMapper;
import com.envisionad.webservice.media.MapperLayer.MediaResponseMapper;
import com.envisionad.webservice.media.PresentationLayer.Models.MediaRequestModel;
import com.envisionad.webservice.media.PresentationLayer.Models.MediaResponseModel;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MediaController.class)
class MediaControllerUnitTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MediaService mediaService;

    @MockitoBean
    private MediaRequestMapper requestMapper;

    @MockitoBean
    private MediaResponseMapper responseMapper;

    @Autowired
    private ObjectMapper objectMapper;

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
    void getAllMedia_ShouldReturnListOfMedia() throws Exception {
        List<Media> mediaList = Arrays.asList(media);
        List<MediaResponseModel> responseList = Arrays.asList(responseModel);

        given(mediaService.getAllMedia()).willReturn(mediaList);
        given(responseMapper.entityListToResponseModelList(mediaList)).willReturn(responseList);

        mockMvc.perform(get("/api/v1/media"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].id").value(mediaId))
                .andExpect(jsonPath("$[0].title").value("Test Media"));
    }

    @Test
    void getAllActiveMedia_ShouldReturnListOfActiveMedia() throws Exception {
        List<Media> mediaList = Arrays.asList(media);
        List<MediaResponseModel> responseList = Arrays.asList(responseModel);

        given(mediaService.getAllActiveMedia()).willReturn(mediaList);
        given(responseMapper.entityListToResponseModelList(mediaList)).willReturn(responseList);

        mockMvc.perform(get("/api/v1/media/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(mediaId));
    }

    @Test
    void getMediaById_WhenFound_ShouldReturnMedia() throws Exception {
        given(mediaService.getMediaById(mediaId)).willReturn(media);
        given(responseMapper.entityToResponseModel(media)).willReturn(responseModel);

        mockMvc.perform(get("/api/v1/media/{id}", mediaId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(mediaId));
    }

    @Test
    void getMediaById_WhenNotFound_ShouldReturn404() throws Exception {
        given(mediaService.getMediaById(mediaId)).willReturn(null);

        mockMvc.perform(get("/api/v1/media/{id}", mediaId))
                .andExpect(status().isNotFound());
    }

    @Test
    void addMedia_ShouldReturnCreatedMedia() throws Exception {
        given(requestMapper.requestModelToEntity(any(MediaRequestModel.class))).willReturn(media);
        given(mediaService.addMedia(any(Media.class))).willReturn(media);
        given(responseMapper.entityToResponseModel(any(Media.class))).willReturn(responseModel);

        mockMvc.perform(post("/api/v1/media")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(mediaId));
    }

    @Test
    void updateMedia_ShouldReturnUpdatedMedia() throws Exception {
        given(requestMapper.requestModelToEntity(any(MediaRequestModel.class))).willReturn(media);
        given(mediaService.updateMedia(any(Media.class))).willReturn(media);
        given(responseMapper.entityToResponseModel(any(Media.class))).willReturn(responseModel);

        mockMvc.perform(put("/api/v1/media/{id}", mediaId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(mediaId));
    }

    @Test
    void deleteMedia_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/v1/media/{id}", mediaId))
                .andExpect(status().isNoContent());

        verify(mediaService).deleteMedia(mediaId);
    }

    @Test
    void uploadImage_WhenMediaExists_ShouldReturnCreated() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.jpg", MediaType.IMAGE_JPEG_VALUE, "test image content".getBytes());

        given(mediaService.getMediaById(mediaId)).willReturn(media);
        given(mediaService.updateMedia(any(Media.class))).willReturn(media);

        mockMvc.perform(multipart("/api/v1/media/{id}/image", mediaId)
                .file(file))
                .andExpect(status().isCreated());
    }

    @Test
    void uploadImage_WhenMediaNotFound_ShouldReturnNotFound() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.jpg", MediaType.IMAGE_JPEG_VALUE, "test image content".getBytes());

        given(mediaService.getMediaById(mediaId)).willReturn(null);

        mockMvc.perform(multipart("/api/v1/media/{id}/image", mediaId)
                .file(file))
                .andExpect(status().isNotFound());
    }

    @Test
    void getImage_WhenMediaAndImageExist_ShouldReturnImage() throws Exception {
        media.setImageData("test image content".getBytes());
        media.setImageContentType(MediaType.IMAGE_JPEG_VALUE);

        given(mediaService.getMediaById(mediaId)).willReturn(media);

        mockMvc.perform(get("/api/v1/media/{id}/image", mediaId))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.IMAGE_JPEG))
                .andExpect(content().bytes(media.getImageData()));
    }

    @Test
    void getImage_WhenMediaNotFound_ShouldReturnNotFound() throws Exception {
        given(mediaService.getMediaById(mediaId)).willReturn(null);

        mockMvc.perform(get("/api/v1/media/{id}/image", mediaId))
                .andExpect(status().isNotFound());
    }
}