package com.envisionad.webservice.media.PresentationLayer;

import com.envisionad.webservice.business.dataaccesslayer.Business;
import com.envisionad.webservice.business.dataaccesslayer.BusinessIdentifier;
import com.envisionad.webservice.business.dataaccesslayer.BusinessRepository;
import com.envisionad.webservice.business.dataaccesslayer.EmployeeRepository;
import com.envisionad.webservice.media.DataAccessLayer.*;
import com.envisionad.webservice.media.PresentationLayer.Models.ScheduleModel;
import com.envisionad.webservice.media.PresentationLayer.Models.WeeklyScheduleEntry;
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

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

@SpringBootTest(webEnvironment = RANDOM_PORT, properties = {
        "spring.datasource.url=jdbc:h2:mem:business-media-db",
        "spring.sql.init.mode=never"
})
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class BusinessMediaControllerIntegrationTest {

    private final String BASE_URI = "/api/v1/businesses/{businessId}/media";

    @Autowired
    private WebTestClient webTestClient;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @MockitoBean
    private EmployeeRepository employeeRepository;

    @Autowired
    private MediaRepository mediaRepository;

    @Autowired
    private MediaLocationRepository mediaLocationRepository;

    @Autowired
    private BusinessRepository businessRepository;

    private String businessId;
    private String businessId2;
    private String businessId_noMedia;
    private String userId;

    @BeforeEach
    void setUp() {
        // Setup user ID and business ID
        userId = "auth0|65702e81e9661e14ab3aac89";
        businessId = UUID.randomUUID().toString();
        businessId2 = UUID.randomUUID().toString();
        businessId_noMedia = UUID.randomUUID().toString();

        // Create business 1 in database
        Business business1 = new Business();
        business1.setBusinessId(new BusinessIdentifier(businessId));
        business1.setName("Test Business");
        business1.setOwnerId(userId);
        businessRepository.save(business1);

        // Create business 2 in database (with no media)
        Business business2 = new Business();
        business2.setBusinessId(new BusinessIdentifier(businessId_noMedia));
        business2.setName("Test Business 2");
        business2.setOwnerId(userId);
        businessRepository.save(business2);

        // Mock employee repository to allow access for this user to both businesses
        when(employeeRepository.existsByUserIdAndBusinessId_BusinessId(userId, businessId)).thenReturn(true);
        when(employeeRepository.existsByUserIdAndBusinessId_BusinessId(userId, businessId_noMedia)).thenReturn(true);

        // Create a media location
        MediaLocation location = new MediaLocation();
        location.setName("Downtown Billboard");
        location.setCountry("Canada");
        location.setProvince("ON");
        location.setCity("Toronto");
        location.setStreet("123 King St");
        location.setPostalCode("M5H 1A1");
        location.setLatitude(43.651070);
        location.setLongitude(-79.347015);
        location.setBusinessId(UUID.fromString(businessId));
        mediaLocationRepository.save(location);

        // Create schedule
        ScheduleModel schedule = new ScheduleModel();
        WeeklyScheduleEntry entry = new WeeklyScheduleEntry();
        entry.setDayOfWeek("Monday");
        entry.setActive(true);
        entry.setStartTime("09:00");
        entry.setEndTime("17:00");
        schedule.setWeeklySchedule(List.of(entry));

        // Create first media for this business
        Media media1 = new Media();
        media1.setBusinessId(UUID.fromString(businessId));
        media1.setMediaLocation(location);
        media1.setTitle("Business Media 1");
        media1.setMediaOwnerName("Test Owner");
        media1.setTypeOfDisplay(TypeOfDisplay.DIGITAL);
        media1.setLoopDuration(30);
        media1.setResolution("1920x1080");
        media1.setAspectRatio("16:9");
        media1.setWidth(1920.0);
        media1.setHeight(1080.0);
        media1.setPrice(new BigDecimal("150.00"));
        media1.setDailyImpressions(25000);
        media1.setStatus(Status.ACTIVE);
        media1.setSchedule(schedule);
        media1.setImageUrl("http://example.com/image1.jpg");
        media1.setPreviewConfiguration("{\"corners\": []}");
        mediaRepository.save(media1);

        // Create second media for this business
        Media media2 = new Media();
        media2.setBusinessId(UUID.fromString(businessId));
        media2.setMediaLocation(location);
        media2.setTitle("Business Media 2");
        media2.setMediaOwnerName("Test Owner");
        media2.setTypeOfDisplay(TypeOfDisplay.POSTER);
        media2.setLoopDuration(null);
        media2.setResolution("1080x1920");
        media2.setAspectRatio("9:16");
        media2.setWidth(1080.0);
        media2.setHeight(1920.0);
        media2.setPrice(new BigDecimal("200.00"));
        media2.setDailyImpressions(30000);
        media2.setStatus(Status.ACTIVE);
        media2.setSchedule(schedule);
        media2.setImageUrl("http://example.com/image2.jpg");
        media2.setPreviewConfiguration("{\"corners\": []}");
        mediaRepository.save(media2);

        // Create a third media for a different business to ensure it doesn't show up in results
        Media media3 = new Media();
        media3.setBusinessId(UUID.fromString(businessId2));
        media3.setMediaLocation(location);
        media3.setTitle("Other Business Media");
        media3.setMediaOwnerName("Test Owner");
        media3.setTypeOfDisplay(TypeOfDisplay.DIGITAL);
        media3.setLoopDuration(30);
        media3.setResolution("1920x1080");
        media3.setAspectRatio("16:9");
        media3.setWidth(1920.0);
        media3.setHeight(1080.0);
        media3.setPrice(new BigDecimal("150.00"));
        media3.setDailyImpressions(25000);
        media3.setStatus(Status.ACTIVE);
        media3.setSchedule(schedule);
        media3.setImageUrl("http://example.com/image3.jpg");
        media3.setPreviewConfiguration("{\"corners\": []}");
        mediaRepository.save(media3);

        // Mock JWT
        Jwt jwt = Jwt.withTokenValue("mock-token")
                .header("alg", "none")
                .claim("sub", userId)
                .claim("scope", "read write")
                .claim("permissions", List.of(
                        "create:media",
                        "update:media",
                        "update:business",
                        "read:employee",
                        "create:employee",
                        "delete:employee",
                        "read:verification",
                        "create:verification",
                        "read:media"
                ))
                .build();

        when(jwtDecoder.decode(anyString())).thenReturn(jwt);
    }

    @Test
    void getMediaByBusinessId_WithValidBusinessId_ShouldReturnAllMediaForBusiness() {
        webTestClient.get()
                .uri(BASE_URI, businessId)
                .accept(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth("mock-token"))
                .exchange()
                .expectStatus().isOk()
                .expectHeader().contentType(MediaType.APPLICATION_JSON)
                .expectBody()
                .jsonPath("$.length()").isEqualTo(2)
                .jsonPath("$[0].businessId").isEqualTo(businessId)
                .jsonPath("$[0].title").isNotEmpty()
                .jsonPath("$[1].businessId").isEqualTo(businessId)
                .jsonPath("$[1].title").isNotEmpty();
    }

    @Test
    void getMediaByBusinessId_WithNoMedia_ShouldReturnEmptyList() {
        // Use a different business ID that has no media
        webTestClient.get()
                .uri(BASE_URI, businessId_noMedia)
                .accept(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth("mock-token"))
                .exchange()
                .expectStatus().isOk()
                .expectHeader().contentType(MediaType.APPLICATION_JSON)
                .expectBody()
                .jsonPath("$.length()").isEqualTo(0);
    }

    @Test
    void getMediaByBusinessId_WithInvalidBusinessId_ShouldReturn400() {
        String invalidBusinessId = "invalid-uuid";

        webTestClient.get()
                .uri(BASE_URI, invalidBusinessId)
                .accept(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth("mock-token"))
                .exchange()
                .expectStatus().isBadRequest();
    }

    @Test
    void getMediaByBusinessId_WithNonExistentBusinessId_ShouldReturn404() {
        String nonExistentBusinessId = UUID.randomUUID().toString();

        webTestClient.get()
                .uri(BASE_URI, nonExistentBusinessId)
                .accept(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth("mock-token"))
                .exchange()
                .expectStatus().isNotFound();
    }

    @Test
    void getMediaByBusinessId_WithDifferentUserNotEmployee_ShouldReturn403() {
        // Create a different user ID
        String differentUserId = "auth0|different-user-id";

        // Mock JWT for different user
        Jwt jwt = Jwt.withTokenValue("different-mock-token")
                .header("alg", "none")
                .claim("sub", differentUserId)
                .claim("scope", "read write")
                .claim("permissions", List.of("read:media"))
                .build();

        when(jwtDecoder.decode("different-mock-token")).thenReturn(jwt);

        // Mock employee repository to deny access for this user
        when(employeeRepository.existsByUserIdAndBusinessId_BusinessId(differentUserId, businessId)).thenReturn(false);

        webTestClient.get()
                .uri(BASE_URI, businessId)
                .accept(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth("different-mock-token"))
                .exchange()
                .expectStatus().isForbidden();
    }
}
