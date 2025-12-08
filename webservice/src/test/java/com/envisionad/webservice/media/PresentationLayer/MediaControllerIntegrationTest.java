package com.envisionad.webservice.media.PresentationLayer;

import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.DataAccessLayer.MediaRepository;
import com.envisionad.webservice.media.DataAccessLayer.Status;
import com.envisionad.webservice.media.DataAccessLayer.TypeOfDisplay;
import com.envisionad.webservice.media.PresentationLayer.Models.MediaRequestModel;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureTestDatabase
class MediaControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MediaRepository mediaRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mediaRepository.deleteAll();
    }

    @Test
    void addMedia_ShouldPersistAndReturnMedia() throws Exception {
        MediaRequestModel requestModel = new MediaRequestModel();
        requestModel.setTitle("Integration Test Media");
        requestModel.setMediaOwnerName("Integration Owner");
        requestModel.setAddress("456 Integration Blvd");
        requestModel.setTypeOfDisplay(TypeOfDisplay.DIGITAL);
        requestModel.setPrice(new BigDecimal("200.00"));
        requestModel.setStatus(Status.ACTIVE);
        requestModel.setDailyImpressions(1000);
        requestModel.setWidth(1920.0);
        requestModel.setHeight(1080.0);
        requestModel.setResolution("1920x1080");
        requestModel.setAspectRatio("16:9");
        requestModel.setLoopDuration(15);

        mockMvc.perform(post("/api/v1/media")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title", is("Integration Test Media")))
                .andExpect(jsonPath("$.id").isNotEmpty());

        assertEquals(1, mediaRepository.count());
    }

    @Test
    void getAllMedia_ShouldReturnAllMedia() throws Exception {
        Media media1 = new Media();
        media1.setTitle("Media 1");
        media1.setTypeOfDisplay(TypeOfDisplay.DIGITAL);
        media1.setStatus(Status.ACTIVE);
        mediaRepository.save(media1);

        Media media2 = new Media();
        media2.setTitle("Media 2");
        media2.setTypeOfDisplay(TypeOfDisplay.POSTER);
        media2.setStatus(Status.INACTIVE);
        mediaRepository.save(media2);

        mockMvc.perform(get("/api/v1/media"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    void getMediaById_ShouldReturnOneMedia() throws Exception {
        Media media = new Media();
        media.setTitle("Media To Find");
        media.setTypeOfDisplay(TypeOfDisplay.DIGITAL);
        media.setStatus(Status.ACTIVE);
        Media savedMedia = mediaRepository.save(media);

        mockMvc.perform(get("/api/v1/media/{id}", savedMedia.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(savedMedia.getId())))
                .andExpect(jsonPath("$.title", is("Media To Find")));
    }

    @Test
    void updateMedia_ShouldUpdateAndReturnMedia() throws Exception {
        Media media = new Media();
        media.setTitle("Original Title");
        media.setTypeOfDisplay(TypeOfDisplay.DIGITAL);
        media.setStatus(Status.ACTIVE);
        Media savedMedia = mediaRepository.save(media);

        MediaRequestModel updateRequest = new MediaRequestModel();
        updateRequest.setTitle("Updated Title");
        updateRequest.setTypeOfDisplay(TypeOfDisplay.DIGITAL);
        updateRequest.setStatus(Status.ACTIVE);

        mockMvc.perform(put("/api/v1/media/{id}", savedMedia.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Updated Title")));

        Media updatedMedia = mediaRepository.findById(savedMedia.getId()).orElseThrow();
        assertEquals("Updated Title", updatedMedia.getTitle());
    }

    @Test
    void deleteMedia_ShouldRemoveMedia() throws Exception {
        Media media = new Media();
        media.setTitle("To Delete");
        media.setTypeOfDisplay(TypeOfDisplay.DIGITAL);
        media.setStatus(Status.ACTIVE);
        Media savedMedia = mediaRepository.save(media);

        mockMvc.perform(delete("/api/v1/media/{id}", savedMedia.getId()))
                .andExpect(status().isNoContent());

        assertEquals(0, mediaRepository.count());
    }
}