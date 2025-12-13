package com.envisionad.webservice.media.PresentationLayer;

import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.DataAccessLayer.MediaRepository;
import com.envisionad.webservice.media.DataAccessLayer.Status;
import com.envisionad.webservice.media.DataAccessLayer.TypeOfDisplay;
import com.envisionad.webservice.media.PresentationLayer.Models.MediaRequestModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.web.reactive.function.BodyInserters;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

@SpringBootTest(webEnvironment = RANDOM_PORT, properties  = {"spring.datasource.url=jdbc:h2:mem:user-db"})
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class MediaControllerIntegrationTest {

    private final String BASE_URI_MEDIA = "/api/v1/media";

    @Autowired
    private WebTestClient webTestClient;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Autowired
    private MediaRepository mediaRepository;

    @BeforeEach
    void setUp() {
        Jwt jwt = Jwt.withTokenValue("mock-token")
                .header("alg", "none")
                .claim("sub", "auth0|65702e81e9661e14ab3aac89")
                .claim("scope", "read write")
                .build();

        when(jwtDecoder.decode(anyString())).thenReturn(jwt);
    }

    @Test
    void addMedia_ShouldPersistAndReturnMedia() {
        // Arrange
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

        // Act & Assert
        webTestClient.post()
                .uri(BASE_URI_MEDIA)
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth("mock-token"))
                .body(BodyInserters.fromValue(requestModel))
                .exchange()
                .expectStatus().isCreated()
                .expectHeader().contentType(MediaType.APPLICATION_JSON)
                .expectBody()
                .jsonPath("$.title").isEqualTo("Integration Test Media")
                .jsonPath("$.id").isNotEmpty();

        assertEquals(34, mediaRepository.count());
    }

    @Test
    void getAllMedia_ShouldReturnAllMedia() {
        // Act & Assert
        webTestClient.get()
                .uri(BASE_URI_MEDIA)
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isOk()
                .expectHeader().contentType(MediaType.APPLICATION_JSON)
                .expectBody()
                .jsonPath("$.length()").isEqualTo(33);
    }

    @Test
    void getMediaById_ShouldReturnOneMedia() {
        String mediaId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

        // Act & Assert
        webTestClient.get()
                .uri(BASE_URI_MEDIA + "/{id}", mediaId)
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isOk()
                .expectHeader().contentType(MediaType.APPLICATION_JSON)
                .expectBody()
                .jsonPath("$.id").isEqualTo(mediaId)
                .jsonPath("$.title").isEqualTo("Downtown Billboard");
    }

    @Test
    void updateMedia_ShouldUpdateAndReturnMedia() {
        String mediaId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
        MediaRequestModel updateRequest = new MediaRequestModel();
        updateRequest.setTitle("Updated Title");
        updateRequest.setTypeOfDisplay(TypeOfDisplay.DIGITAL);
        updateRequest.setStatus(Status.ACTIVE);

        // Act & Assert
        webTestClient.put()
                .uri(BASE_URI_MEDIA + "/{id}", mediaId)
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth("mock-token"))
                .body(BodyInserters.fromValue(updateRequest))
                .exchange()
                .expectStatus().isOk()
                .expectHeader().contentType(MediaType.APPLICATION_JSON)
                .expectBody()
                .jsonPath("$.title").isEqualTo("Updated Title");

        Media updatedMedia = mediaRepository.findById(mediaId).orElseThrow();
        assertEquals("Updated Title", updatedMedia.getTitle());
    }

    @Test
    void deleteMedia_ShouldRemoveMedia() {
        String mediaId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
        // Act & Assert
        webTestClient.delete()
                .uri(BASE_URI_MEDIA + "/{id}", mediaId)
                .exchange()
                .expectStatus().isNoContent();

        assertEquals(32, mediaRepository.count());
    }
}