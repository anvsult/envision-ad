package com.envisionad.webservice.reservation.presentationlayer;

import com.envisionad.webservice.advertisement.dataaccesslayer.Ad;
import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaign;
import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaignIdentifier;
import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaignRepository;
import com.envisionad.webservice.advertisement.dataaccesslayer.AdDuration;
import com.envisionad.webservice.business.dataaccesslayer.*;
import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.DataAccessLayer.MediaRepository;
import com.envisionad.webservice.media.DataAccessLayer.Status;
import com.envisionad.webservice.media.DataAccessLayer.TypeOfDisplay;
import com.envisionad.webservice.media.PresentationLayer.Models.ScheduleModel;
import com.envisionad.webservice.media.PresentationLayer.Models.WeeklyScheduleEntry;
import com.envisionad.webservice.reservation.dataaccesslayer.Reservation;
import com.envisionad.webservice.reservation.dataaccesslayer.ReservationRepository;
import com.envisionad.webservice.reservation.dataaccesslayer.ReservationStatus;
import com.envisionad.webservice.reservation.presentationlayer.models.ReservationRequestModel;
import com.envisionad.webservice.utils.EmailService;
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
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

@SpringBootTest(webEnvironment = RANDOM_PORT, properties = {
        "spring.datasource.url=jdbc:h2:mem:reservation-db",
        "spring.sql.init.mode=never"
})
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class ReservationControllerIntegrationTest {

    private static final String BASE_URI_RESERVATIONS = "/api/v1/media/{mediaId}/reservations";
    private static final String USER_ID = "auth0|65702e81e9661e14ab3aac89";
    private static final String OTHER_USER_ID = "auth0|65702e81e9661e14ab3aac90";
    private static final String BUSINESS_ID = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22";

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

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private AdCampaignRepository adCampaignRepository;

    @Autowired
    private com.envisionad.webservice.advertisement.dataaccesslayer.AdRepository adRepository;

    @Autowired
    private BusinessRepository businessRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    private String mediaId;
    private String campaignId;

    @BeforeEach
    void setUp() {
        // Setup JWT mock
        Jwt jwt = Jwt.withTokenValue("mock-token")
                .header("alg", "none")
                .claim("sub", USER_ID)
                .claim("scope", "read write")
                .claim("permissions", List.of(
                        "create:reservation",
                        "readAll:reservation"))
                .build();

        when(jwtDecoder.decode(anyString())).thenReturn(jwt);

        // Create Business
        Business business = new Business();
        business.setBusinessId(new BusinessIdentifier(BUSINESS_ID));
        business.setName("Test Business");
        business.setOwnerId(USER_ID);
        business.setOrganizationSize(OrganizationSize.SMALL);
        business.setVerified(true);
        Address address = new Address();
        address.setCountry("Canada");
        address.setState("ON");
        address.setCity("Toronto");
        address.setStreet("123 Test St");
        address.setZipCode("M5H 1A1");
        business.setAddress(address);
        Roles roles = new Roles();
        roles.setAdvertiser(true);
        business.setRoles(roles);
        businessRepository.save(business);
        String businessId = business.getBusinessId().getBusinessId();

        // Create Employee linked to user
        Employee employee = new Employee();
        employee.setEmployeeId(new EmployeeIdentifier());
        employee.setBusinessId(new BusinessIdentifier(businessId));
        employee.setUserId(USER_ID);
        employee.setEmail("test@example.com");
        employeeRepository.save(employee);

        // Create Media Location
        com.envisionad.webservice.media.DataAccessLayer.MediaLocation location =
                new com.envisionad.webservice.media.DataAccessLayer.MediaLocation();
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

        // Create Media
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

        media.setImageUrl("http://example.com/image.jpg");
        media.setPreviewConfiguration("{\"corners\": []}");
        mediaRepository.save(media);
        this.mediaId = media.getId().toString();

        // Create Ad Campaign
        AdCampaign campaign = new AdCampaign();
        campaign.setCampaignId(new AdCampaignIdentifier());
        campaign.setBusinessId(new BusinessIdentifier(businessId));
        campaign.setName("Test Campaign");
        adCampaignRepository.save(campaign);
        this.campaignId = campaign.getCampaignId().getCampaignId();
    }

    @Test
    void createReservation_ShouldPersistAndReturnReservation() {
        // Arrange
        ReservationRequestModel requestModel = new ReservationRequestModel();
        requestModel.setMediaId(this.mediaId);
        requestModel.setCampaignId(this.campaignId);
        requestModel.setStartDate(LocalDateTime.now().plusDays(1));
        requestModel.setEndDate(LocalDateTime.now().plusDays(8));

        // Act & Assert
        webTestClient.post()
                .uri(BASE_URI_RESERVATIONS, this.mediaId)
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth("mock-token"))
                .body(BodyInserters.fromValue(requestModel))
                .exchange()
                .expectStatus().isCreated()
                .expectHeader().contentType(MediaType.APPLICATION_JSON)
                .expectBody()
                .jsonPath("$.reservationId").isNotEmpty()
                .jsonPath("$.campaignId").isEqualTo(this.campaignId)
                .jsonPath("$.status").isEqualTo("PENDING")
                .jsonPath("$.totalPrice").isNumber();

        // Verify reservation was saved
        assertEquals(1, reservationRepository.count());

        // Verify email was sent
        verify(emailService, times(1)).sendSimpleEmail(anyString(), anyString(), anyString());
    }

    @Test
    void createReservation_WithMultipleWeeks_ShouldCalculateCorrectPrice() {
        // Arrange
        LocalDateTime startDate = LocalDateTime.now().plusDays(1);
        LocalDateTime endDate = LocalDateTime.now().plusDays(22); // 3 weeks

        ReservationRequestModel requestModel = new ReservationRequestModel();
        requestModel.setMediaId(this.mediaId);
        requestModel.setCampaignId(this.campaignId);
        requestModel.setStartDate(startDate);
        requestModel.setEndDate(endDate);

        // Expected price: 150.00 * 3 weeks = 450.00
        BigDecimal expectedPrice = new BigDecimal("450.00");

        // Act & Assert
        webTestClient.post()
                .uri(BASE_URI_RESERVATIONS, this.mediaId)
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth("mock-token"))
                .body(BodyInserters.fromValue(requestModel))
                .exchange()
                .expectStatus().isCreated()
                .expectHeader().contentType(MediaType.APPLICATION_JSON)
                .expectBody()
                .jsonPath("$.totalPrice").isEqualTo(expectedPrice.doubleValue());

        // Verify in database
        Reservation savedReservation = reservationRepository.findAll().getFirst();
        assertEquals(0, expectedPrice.compareTo(savedReservation.getTotalPrice()));
    }

    @Test
    void createReservation_WithNonExistentMedia_ShouldReturn404() {
        // Arrange
        String nonExistentMediaId = UUID.randomUUID().toString();

        ReservationRequestModel requestModel = new ReservationRequestModel();
        requestModel.setMediaId(nonExistentMediaId);
        requestModel.setCampaignId(this.campaignId);
        requestModel.setStartDate(LocalDateTime.now().plusDays(1));
        requestModel.setEndDate(LocalDateTime.now().plusDays(8));

        // Act & Assert
        webTestClient.post()
                .uri(BASE_URI_RESERVATIONS, nonExistentMediaId)
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth("mock-token"))
                .body(BodyInserters.fromValue(requestModel))
                .exchange()
                .expectStatus().isNotFound();

        // Verify no reservation was saved
        assertEquals(0, reservationRepository.count());
    }

    @Test
    void createReservation_WithNonExistentCampaign_ShouldReturn404() {
        // Arrange
        String nonExistentCampaignId = UUID.randomUUID().toString();

        ReservationRequestModel requestModel = new ReservationRequestModel();
        requestModel.setMediaId(this.mediaId);
        requestModel.setCampaignId(nonExistentCampaignId);
        requestModel.setStartDate(LocalDateTime.now().plusDays(1));
        requestModel.setEndDate(LocalDateTime.now().plusDays(8));

        // Act & Assert
        webTestClient.post()
                .uri(BASE_URI_RESERVATIONS, this.mediaId)
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth("mock-token"))
                .body(BodyInserters.fromValue(requestModel))
                .exchange()
                .expectStatus().isNotFound();

        // Verify no reservation was saved
        assertEquals(0, reservationRepository.count());
    }

    @Test
    void createReservation_WithEndDateBeforeStartDate_ShouldReturn400() {
        // Arrange
        ReservationRequestModel requestModel = new ReservationRequestModel();
        requestModel.setMediaId(this.mediaId);
        requestModel.setCampaignId(this.campaignId);
        requestModel.setStartDate(LocalDateTime.now().plusDays(8));
        requestModel.setEndDate(LocalDateTime.now().plusDays(1)); // Before start date

        // Act & Assert
        webTestClient.post()
                .uri(BASE_URI_RESERVATIONS, this.mediaId)
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth("mock-token"))
                .body(BodyInserters.fromValue(requestModel))
                .exchange()
                .expectStatus().isBadRequest();

        // Verify no reservation was saved
        assertEquals(0, reservationRepository.count());
    }

    @Test
    void createReservation_WithPastStartDate_ShouldReturn400() {
        // Arrange
        ReservationRequestModel requestModel = new ReservationRequestModel();
        requestModel.setMediaId(this.mediaId);
        requestModel.setCampaignId(this.campaignId);
        requestModel.setStartDate(LocalDateTime.now().minusDays(1)); // Past date
        requestModel.setEndDate(LocalDateTime.now().plusDays(7));

        // Act & Assert
        webTestClient.post()
                .uri(BASE_URI_RESERVATIONS, this.mediaId)
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth("mock-token"))
                .body(BodyInserters.fromValue(requestModel))
                .exchange()
                .expectStatus().isBadRequest();

        // Verify no reservation was saved
        assertEquals(0, reservationRepository.count());
    }

    @Test
    void createReservation_UserNotEmployeeOfBusiness_ShouldReturn403() {
        // Arrange - Create JWT for different user
        Jwt unauthorizedJwt = Jwt.withTokenValue("unauthorized-token")
                .header("alg", "none")
                .claim("sub", OTHER_USER_ID)
                .claim("scope", "read write")
                .claim("permissions", List.of("create:reservation"))
                .build();

        when(jwtDecoder.decode("unauthorized-token")).thenReturn(unauthorizedJwt);

        ReservationRequestModel requestModel = new ReservationRequestModel();
        requestModel.setMediaId(this.mediaId);
        requestModel.setCampaignId(this.campaignId);
        requestModel.setStartDate(LocalDateTime.now().plusDays(1));
        requestModel.setEndDate(LocalDateTime.now().plusDays(8));

        // Act & Assert
        webTestClient.post()
                .uri(BASE_URI_RESERVATIONS, this.mediaId)
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth("unauthorized-token"))
                .body(BodyInserters.fromValue(requestModel))
                .exchange()
                .expectStatus().isForbidden();

        // Verify no reservation was saved
        assertEquals(0, reservationRepository.count());
    }

    @Test
    void createReservation_WithInsufficientLoopDuration_ShouldReturn400() {
        // Arrange - Create a first campaign with ads that fill the loop duration (30 seconds)
        AdCampaign firstCampaign = adCampaignRepository.findByCampaignId_CampaignId(this.campaignId);

        Ad ad1 = new Ad();
        ad1.setCampaign(firstCampaign);
        ad1.setAdDurationSeconds(AdDuration.S30); // 30 seconds - fills the entire loop
        adRepository.save(ad1);

        // Create a confirmed reservation for the first campaign
        Reservation existingReservation = new Reservation();
        existingReservation.setReservationId(UUID.randomUUID().toString());
        existingReservation.setMediaId(UUID.fromString(this.mediaId));
        existingReservation.setCampaignId(this.campaignId);
        existingReservation.setAdvertiserId(USER_ID);
        existingReservation.setStatus(ReservationStatus.CONFIRMED);
        existingReservation.setStartDate(LocalDateTime.now().plusDays(1));
        existingReservation.setEndDate(LocalDateTime.now().plusDays(8));
        existingReservation.setTotalPrice(new BigDecimal("150.00"));
        reservationRepository.save(existingReservation);

        // Create a second campaign with ads
        AdCampaign secondCampaign = new AdCampaign();
        secondCampaign.setCampaignId(new AdCampaignIdentifier());
        secondCampaign.setBusinessId(firstCampaign.getBusinessId());
        secondCampaign.setName("Second Campaign");
        adCampaignRepository.save(secondCampaign);

        Ad ad2 = new Ad();
        ad2.setCampaign(secondCampaign);
        ad2.setAdDurationSeconds(AdDuration.S10); // Any duration - loop is already full
        adRepository.save(ad2);

        // Try to create a new reservation with the second campaign during overlapping dates
        ReservationRequestModel requestModel = new ReservationRequestModel();
        requestModel.setMediaId(this.mediaId);
        requestModel.setCampaignId(secondCampaign.getCampaignId().getCampaignId());
        requestModel.setStartDate(LocalDateTime.now().plusDays(2));
        requestModel.setEndDate(LocalDateTime.now().plusDays(9));

        // Act & Assert - Should fail because loop duration is already full
        webTestClient.post()
                .uri(BASE_URI_RESERVATIONS, this.mediaId)
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth("mock-token"))
                .body(BodyInserters.fromValue(requestModel))
                .exchange()
                .expectStatus().isBadRequest();

        // Verify only the existing reservation exists
        assertEquals(1, reservationRepository.count());
    }

    @Test
    void getAllMediaReservations_ShouldReturnAllReservations() {
        // Arrange - Create some reservations
        Reservation reservation1 = new Reservation();
        reservation1.setReservationId(UUID.randomUUID().toString());
        reservation1.setMediaId(UUID.fromString(this.mediaId));
        reservation1.setCampaignId(this.campaignId);
        reservation1.setAdvertiserId(USER_ID);
        reservation1.setStatus(ReservationStatus.PENDING);
        reservation1.setStartDate(LocalDateTime.now().plusDays(1));
        reservation1.setEndDate(LocalDateTime.now().plusDays(8));
        reservation1.setTotalPrice(new BigDecimal("150.00"));
        reservationRepository.save(reservation1);

        Reservation reservation2 = new Reservation();
        reservation2.setReservationId(UUID.randomUUID().toString());
        reservation2.setMediaId(UUID.fromString(this.mediaId));
        reservation2.setCampaignId(this.campaignId);
        reservation2.setAdvertiserId(USER_ID);
        reservation2.setStatus(ReservationStatus.CONFIRMED);
        reservation2.setStartDate(LocalDateTime.now().plusDays(10));
        reservation2.setEndDate(LocalDateTime.now().plusDays(17));
        reservation2.setTotalPrice(new BigDecimal("150.00"));
        reservationRepository.save(reservation2);

        // Act & Assert
        webTestClient.get()
                .uri(BASE_URI_RESERVATIONS, this.mediaId)
                .accept(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth("mock-token"))
                .exchange()
                .expectStatus().isOk()
                .expectHeader().contentType(MediaType.APPLICATION_JSON)
                .expectBody()
                .jsonPath("$.length()").isEqualTo(2)
                .jsonPath("$[0].reservationId").isNotEmpty()
                .jsonPath("$[1].reservationId").isNotEmpty();
    }

    @Test
    void createReservation_WithoutAuthentication_ShouldReturn401() {
        // Arrange
        ReservationRequestModel requestModel = new ReservationRequestModel();
        requestModel.setMediaId(this.mediaId);
        requestModel.setCampaignId(this.campaignId);
        requestModel.setStartDate(LocalDateTime.now().plusDays(1));
        requestModel.setEndDate(LocalDateTime.now().plusDays(8));

        // Act & Assert
        webTestClient.post()
                .uri(BASE_URI_RESERVATIONS, this.mediaId)
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .body(BodyInserters.fromValue(requestModel))
                .exchange()
                .expectStatus().isUnauthorized();

        // Verify no reservation was saved
        assertEquals(0, reservationRepository.count());
    }
}

