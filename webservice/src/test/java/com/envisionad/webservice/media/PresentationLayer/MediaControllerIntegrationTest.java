package com.envisionad.webservice.media.PresentationLayer;

import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.DataAccessLayer.MediaRepository;
import com.envisionad.webservice.media.DataAccessLayer.Status;
import com.envisionad.webservice.media.DataAccessLayer.TypeOfDisplay;
import com.envisionad.webservice.media.PresentationLayer.Models.MediaRequestModel;
import com.envisionad.webservice.utils.EmailService;
import com.envisionad.webservice.media.PresentationLayer.Models.ScheduleModel;
import com.envisionad.webservice.media.PresentationLayer.Models.WeeklyScheduleEntry;
import java.util.List;
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
import java.util.UUID;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

@SpringBootTest(webEnvironment = RANDOM_PORT, properties = {
        "spring.datasource.url=jdbc:h2:mem:user-db",
        "spring.sql.init.mode=never"
})
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class MediaControllerIntegrationTest {

    private final String BASE_URI_MEDIA = "/api/v1/media";

    @Autowired
    private WebTestClient webTestClient;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @MockitoBean
    private EmailService emailService;

    @Autowired
    private MediaRepository mediaRepository;

    @Autowired
    private com.envisionad.webservice.media.DataAccessLayer.MediaLocationRepository mediaLocationRepository;

    private String mediaId;
    private String mediaLocationId;

    @BeforeEach
    void setUp() {
        Jwt jwt = Jwt.withTokenValue("mock-token")
                .header("alg", "none")
                .claim("sub", "auth0|65702e81e9661e14ab3aac89")
                .claim("scope", "read write")
                .claim("permissions", List.of(
                        "create:employee",
                        "create:media",
                        "delete:employee",
                        "read:employee",
                        "update:business",
                        "update:media"
                ))
                .build();

        when(jwtDecoder.decode(anyString())).thenReturn(jwt);

        com.envisionad.webservice.media.DataAccessLayer.MediaLocation location = new com.envisionad.webservice.media.DataAccessLayer.MediaLocation();
        location.setName("Downtown Billboard A");
        location.setDescription("Large DIGITAL billboard");
        location.setCountry("Canada");
        location.setProvince("ON");
        location.setCity("Toronto");
        location.setStreet("123 King St W");
        location.setPostalCode("M5H 1A1");
        location.setLatitude(43.651070);
        location.setLongitude(-79.347015);
        mediaLocationRepository.save(location);
        this.mediaLocationId = location.getId().toString();

        Media media = new Media();
        media.setMediaLocation(location);
        media.setTitle("Downtown Digital Board");
        media.setMediaOwnerName("MetroAds");
        media.setTypeOfDisplay(TypeOfDisplay.DIGITAL);
        media.setLoopDuration(30);
        media.setResolution("1920x1080");
        media.setAspectRatio("16:9");
        media.setWidth(1920.0);
        media.setHeight(1080.0);
        media.setPrice(new BigDecimal("150.00"));
        media.setDailyImpressions(25000);
        media.setStatus(Status.ACTIVE);

        ScheduleModel schedule = new ScheduleModel();
        WeeklyScheduleEntry entry = new WeeklyScheduleEntry();
        entry.setDayOfWeek("Monday");
        entry.setActive(true);
        entry.setStartTime("09:00");
        entry.setEndTime("17:00");
        schedule.setWeeklySchedule(List.of(entry));
        media.setSchedule(schedule);

        mediaRepository.save(media);
        this.mediaId = media.getId().toString();
    }

    @Test
    void addMedia_ShouldPersistAndReturnMedia() {
        // Arrange
        MediaRequestModel requestModel = new MediaRequestModel();
        requestModel.setTitle("Integration Test Media");
        requestModel.setMediaOwnerName("Integration Owner");
        requestModel.setMediaLocationId(this.mediaLocationId);
        requestModel.setTypeOfDisplay(TypeOfDisplay.DIGITAL);
        requestModel.setPrice(new BigDecimal("200.00"));
        requestModel.setStatus(Status.ACTIVE);
        requestModel.setDailyImpressions(1000);
        requestModel.setWidth(1920.0);
        requestModel.setHeight(1080.0);
        requestModel.setResolution("1920x1080");
        requestModel.setAspectRatio("16:9");
        requestModel.setLoopDuration(15);

        ScheduleModel schedule = new ScheduleModel();
        WeeklyScheduleEntry entry = new WeeklyScheduleEntry();
        entry.setDayOfWeek("Monday");
        entry.setActive(true);
        entry.setStartTime("09:00");
        entry.setEndTime("17:00");
        schedule.setWeeklySchedule(List.of(entry));
        requestModel.setSchedule(schedule);

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

        assertEquals(2, mediaRepository.count());
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
                .jsonPath("$.length()").isEqualTo(1);
    }

    @Test
    void getMediaById_ShouldReturnOneMedia() {
        // Act & Assert
        webTestClient.get()
                .uri(BASE_URI_MEDIA + "/{id}", this.mediaId)
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isOk()
                .expectHeader().contentType(MediaType.APPLICATION_JSON)
                .expectBody()
                .jsonPath("$.id").isEqualTo(mediaId)
                .jsonPath("$.title").isEqualTo("Downtown Digital Board");
    }

    @Test
    void updateMedia_ShouldUpdateAndReturnMedia() {
        MediaRequestModel updateRequest = new MediaRequestModel();
        updateRequest.setTitle("Updated Title");
        updateRequest.setMediaOwnerName("Integration Owner");
        updateRequest.setMediaLocationId(this.mediaLocationId);
        updateRequest.setTypeOfDisplay(TypeOfDisplay.DIGITAL);
        updateRequest.setStatus(Status.ACTIVE);

        ScheduleModel schedule = new ScheduleModel();
        WeeklyScheduleEntry entry = new WeeklyScheduleEntry();
        entry.setDayOfWeek("Monday");
        entry.setActive(true);
        entry.setStartTime("09:00");
        entry.setEndTime("17:00");
        schedule.setWeeklySchedule(List.of(entry));
        updateRequest.setPrice(new BigDecimal("300.00"));
        updateRequest.setDailyImpressions(2000);
        updateRequest.setResolution("1920x1080");
        updateRequest.setAspectRatio("16:9");
        updateRequest.setLoopDuration(20);
        updateRequest.setSchedule(schedule);

        // Act & Assert
        webTestClient.put()
                .uri(BASE_URI_MEDIA + "/{id}", this.mediaId)
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth("mock-token"))
                .body(BodyInserters.fromValue(updateRequest))
                .exchange()
                .expectStatus().isOk()
                .expectHeader().contentType(MediaType.APPLICATION_JSON)
                .expectBody()
                .jsonPath("$.title").isEqualTo("Updated Title");

        Media updatedMedia = mediaRepository.findById(UUID.fromString(this.mediaId)).orElseThrow();
        assertEquals("Updated Title", updatedMedia.getTitle());
    }

    @Test
    void deleteMedia_ShouldRemoveMedia() {
        // Arrange
        Media media = mediaRepository.findAll().get(0);
        String mediaIdToDelete = media.getId().toString();

        // Act & Assert
        webTestClient.delete()
                .uri(BASE_URI_MEDIA + "/{id}", mediaIdToDelete)
                .exchange()
                .expectStatus().isNoContent();

        assertEquals(0, mediaRepository.count());
    }
}
