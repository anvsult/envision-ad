package com.envisionad.webservice.advertisement.presentationlayer;

import com.envisionad.webservice.advertisement.dataaccesslayer.*;
import com.envisionad.webservice.advertisement.presentationlayer.models.AdCampaignRequestModel;
import com.envisionad.webservice.advertisement.presentationlayer.models.AdRequestModel;
import com.envisionad.webservice.business.dataaccesslayer.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.reactive.server.WebTestClient;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

@SpringBootTest(webEnvironment = RANDOM_PORT, properties = {"spring.datasource.url=jdbc:h2:mem:ad-db"})
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
public class AdCampaignIntegrationTest {
    private final String BASE_URI_AD_CAMPAIGNS = "/api/v1/businesses/{businessId}/campaigns";

    @Autowired
    private WebTestClient webTestClient;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Autowired
    private AdCampaignRepository adCampaignRepository;

    @Autowired
    private BusinessRepository businessRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    private BusinessIdentifier businessId;
    private static final String TEST_USER_ID = "auth0|65702e81e9661e14ab3aac89";

    @BeforeEach
    void setUp() {
        // Initialize businessId for all tests
        businessId = new BusinessIdentifier();

        // Create a test business
        Business business = new Business();
        business.setBusinessId(businessId);
        business.setName("Test Business");
        business.setOwnerId(TEST_USER_ID);
        business.setOrganizationSize(OrganizationSize.LARGE);
        businessRepository.save(business);

        // Create an employee for the test user
        Employee employee = new Employee();
        employee.setEmployeeId(new EmployeeIdentifier());
        employee.setBusinessId(businessId);
        employee.setUserId(TEST_USER_ID);
        employeeRepository.save(employee);

        // Mock JWT token
        Jwt jwt = Jwt.withTokenValue("mock-token")
                .header("alg", "none")
                .claim("sub", TEST_USER_ID)
                .claim("scope", "read write")
                .claim("permissions", java.util.List.of("create:media", "update:media", "readAll:campaign", "create:campaign"))
                .build();
        when(jwtDecoder.decode(anyString())).thenReturn(jwt);

    }

    @Test
    void getAllBusinessCampaigns_shouldReturnAllBusinessCampaigns() {
        // Arrange - Create test campaigns for a business
        AdCampaign campaign1 = new AdCampaign();
        campaign1.setName("Winter Sale");
        campaign1.setCampaignId(new AdCampaignIdentifier());
        campaign1.setBusinessId(businessId);

        AdCampaign campaign2 = new AdCampaign();
        campaign2.setName("Summer Sale");
        campaign2.setCampaignId(new AdCampaignIdentifier());
        campaign2.setBusinessId(businessId);

        adCampaignRepository.save(campaign1);
        adCampaignRepository.save(campaign2);

        // Act & Assert
        webTestClient.get()
                .uri(BASE_URI_AD_CAMPAIGNS, businessId.getBusinessId())
                .header("Authorization", "Bearer mock-token")
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(Object.class)
                .hasSize(2);
    }

    @Test
    void createAdCampaign_shouldCreateNewCampaign() {
        // Arrange
        AdCampaignRequestModel requestModel = new AdCampaignRequestModel();
        requestModel.setName("Summer Sale");

        // Act & Assert
        webTestClient.post()
                .uri(BASE_URI_AD_CAMPAIGNS, businessId.getBusinessId())
                .header("Authorization", "Bearer mock-token")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .bodyValue(requestModel)
                .exchange()
                .expectStatus().isCreated()
                .expectBody()
                .jsonPath("$.name").isEqualTo("Summer Sale")
                .jsonPath("$.campaignId").isNotEmpty();

        // Assert
        assertEquals(1, adCampaignRepository.count());
    }

    @Test
    void addAdToCampaign_shouldAddAdSuccessfully() {
        // Arrange

        AdCampaign adCampaign = new AdCampaign();
        adCampaign.setName("Winter Sale");
        adCampaign.setCampaignId(new AdCampaignIdentifier());
        adCampaign.setBusinessId(businessId);

        AdCampaign savedCampaign = adCampaignRepository.save(adCampaign);
        String campaignId = savedCampaign.getCampaignId().getCampaignId();

        AdRequestModel adRequestModel = new AdRequestModel();
        adRequestModel.setName("Summer Beach Banner");
        adRequestModel.setAdUrl("https://cdn.envisionad.com/summer-beach.jpg");
        adRequestModel.setAdDurationSeconds(30);
        adRequestModel.setAdType("IMAGE");

        // Act & Assert
        webTestClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path(BASE_URI_AD_CAMPAIGNS + "/{campaignId}/ads")
                        .build(businessId.getBusinessId(), campaignId))
                .header("Authorization", "Bearer mock-token")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .bodyValue(adRequestModel)
                .exchange()
                .expectStatus().isCreated()
                .expectBody()
                .jsonPath("$.name").isEqualTo("Summer Beach Banner")
                .jsonPath("$.adUrl").isEqualTo("https://cdn.envisionad.com/summer-beach.jpg")
                .jsonPath("$.adDurationSeconds").isEqualTo(30)
                .jsonPath("$.adType").isEqualTo("IMAGE")
                .jsonPath("$.adId").isNotEmpty();
        // Assert
        assertEquals(1, adCampaignRepository.count());
        AdCampaign updatedCampaign = adCampaignRepository.findByCampaignIdWithAds(savedCampaign.getCampaignId().getCampaignId());
        assertNotNull(updatedCampaign.getAds());
        assertEquals(1, updatedCampaign.getAds().size());
    }

    @Test
    void createAdCampaign_shouldPersistCampaign() {
        // Arrange
        AdCampaignRequestModel requestModel = new AdCampaignRequestModel();
        requestModel.setName("Spring Sale");

        // Act
        webTestClient.post()
                .uri(BASE_URI_AD_CAMPAIGNS, businessId.getBusinessId())
                .header("Authorization", "Bearer mock-token")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .bodyValue(requestModel)
                .exchange()
                .expectStatus().isCreated();

        // Assert
        assertEquals(1, adCampaignRepository.count());
        AdCampaign savedCampaign = adCampaignRepository.findAll().get(0);
        assertEquals("Spring Sale", savedCampaign.getName());
        assertNotNull(savedCampaign.getCampaignId());
        assertNotNull(savedCampaign.getCampaignId().getCampaignId());
    }

    @Test
    void deleteAdFromCampaign_shouldDeleteAdSuccessfully() {

        AdCampaign adCampaign = new AdCampaign();
        adCampaign.setName("Winter Sale");
        adCampaign.setCampaignId(new AdCampaignIdentifier());
        adCampaign.setBusinessId(businessId);

        Ad ad = new Ad();
        ad.setName("Winter Discount");
        ad.setAdUrl("http://example.com/winter-discount");
        ad.setAdType(AdType.IMAGE);
        ad.setAdDurationSeconds(AdDuration.S10);
        ad.setAdIdentifier(new AdIdentifier());

        // IMPORTANT: set both sides of the relationship before save
        ad.setCampaign(adCampaign);
        adCampaign.getAds().add(ad);

        AdCampaign savedCampaign = adCampaignRepository.save(adCampaign);
        String campaignId = savedCampaign.getCampaignId().getCampaignId();
        String adId = ad.getAdIdentifier().getAdIdentifier();

        webTestClient.delete()
                .uri(uriBuilder -> uriBuilder
                        .path(BASE_URI_AD_CAMPAIGNS + "/{campaignId}/ads/{adId}")
                        .build(businessId.getBusinessId(), campaignId, adId))
                .header("Authorization", "Bearer mock-token")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.name").isEqualTo("Winter Discount")
                .jsonPath("$.adUrl").isEqualTo("http://example.com/winter-discount")
                .jsonPath("$.adType").isEqualTo("IMAGE")
                .jsonPath("$.adDurationSeconds").isEqualTo(10)
                .jsonPath("$.adId").isEqualTo(adId);

        AdCampaign updatedCampaign = adCampaignRepository.findByCampaignIdWithAds(campaignId);
        assertNotNull(updatedCampaign.getAds());
        assertEquals(0, updatedCampaign.getAds().size());
    }


    //    ============ NEGATIVE TESTS ============
    @Test
    void addAdToCampaign_shouldThrowInvalidAdTypeException_whenTypeIsInvalid() {
        // Arrange

        AdCampaign adCampaign = new AdCampaign();
        adCampaign.setName("Winter Sale");
        adCampaign.setCampaignId(new AdCampaignIdentifier());
        adCampaign.setBusinessId(businessId);
        AdCampaign savedCampaign = adCampaignRepository.save(adCampaign);
        String campaignId = savedCampaign.getCampaignId().getCampaignId();

        AdRequestModel adRequestModel = new AdRequestModel();
        adRequestModel.setName("Invalid Type Ad");
        adRequestModel.setAdUrl("https://cdn.envisionad.com/img.jpg");
        adRequestModel.setAdDurationSeconds(30);
        // ACT: Set an invalid Type string to trigger IllegalArgumentException in the service
        adRequestModel.setAdType("NON_EXISTENT_TYPE");

        // Act & Assert
        webTestClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path(BASE_URI_AD_CAMPAIGNS + "/{campaignId}/ads")
                        .build(businessId.getBusinessId(), campaignId))
                .header("Authorization", "Bearer mock-token")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .bodyValue(adRequestModel)
                .exchange()
                // EXPECTATION: Depends on your GlobalExceptionHandler.
                // Usually 422 (Unprocessable Entity) or 400 (Bad Request).
                .expectStatus().is4xxClientError()
                .expectBody()
                // Optional: Check if the error message matches your exception message
                .jsonPath("$.message").value(v -> v.toString().contains("NON_EXISTENT_TYPE"));
    }

    @Test
    void addAdToCampaign_shouldThrowInvalidAdDurationException_whenDurationIsInvalid() {
        // Arrange

        AdCampaign adCampaign = new AdCampaign();
        adCampaign.setName("Winter Sale");
        adCampaign.setCampaignId(new AdCampaignIdentifier());
        adCampaign.setBusinessId(businessId);
        AdCampaign savedCampaign = adCampaignRepository.save(adCampaign);
        String campaignId = savedCampaign.getCampaignId().getCampaignId();

        AdRequestModel adRequestModel = new AdRequestModel();
        adRequestModel.setName("Invalid Duration Ad");
        adRequestModel.setAdUrl("https://cdn.envisionad.com/img.jpg");
        adRequestModel.setAdType("IMAGE"); // Valid type
        // ACT: Set invalid duration (assuming your domain logic rejects negative numbers)
        adRequestModel.setAdDurationSeconds(-50);

        // Act & Assert
        webTestClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path(BASE_URI_AD_CAMPAIGNS + "/{campaignId}/ads")
                        .build(businessId.getBusinessId(), campaignId))
                .header("Authorization", "Bearer mock-token")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .bodyValue(adRequestModel)
                .exchange()
                .expectStatus().is4xxClientError(); // Expect 422 or 400
    }

    @Test
    void addAdToCampaign_shouldThrowNotFound_whenCampaignDoesNotExist() {
        // Arrange
        String nonExistentId = "999-invalid-id";

        AdRequestModel adRequestModel = new AdRequestModel();
        adRequestModel.setName("Orphan Ad");
        adRequestModel.setAdUrl("https://cdn.envisionad.com/img.jpg");
        adRequestModel.setAdDurationSeconds(30);
        adRequestModel.setAdType("IMAGE");

        // Act & Assert
        webTestClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path(BASE_URI_AD_CAMPAIGNS + "/{campaignId}/ads")
                        .build(businessId.getBusinessId(), nonExistentId))
                .header("Authorization", "Bearer mock-token")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .bodyValue(adRequestModel)
                .exchange()
                .expectStatus().isNotFound();
    }

    @Test
    void deleteAdFromNonExistingCampaign_shouldReturnCampaignNotFound() {
        // Arrange
        String nonExistentCampaignId = "non-existent-campaign-id";
        String adId = UUID.randomUUID().toString();


        // Act & Assert
        webTestClient.delete()
                .uri(uriBuilder -> uriBuilder
                        .path(BASE_URI_AD_CAMPAIGNS + "/{campaignId}/ads/{adId}")
                        .build(businessId.getBusinessId(), nonExistentCampaignId, adId))
                .header("Authorization", "Bearer mock-token")
                .exchange()
                .expectStatus().isNotFound();
    }

    @Test
    void deleteNonExistingAdFromCampaign_shouldReturnAdNotFound() {
        // Arrange

        AdCampaign adCampaign = new AdCampaign();
        adCampaign.setName("Winter Sale");
        adCampaign.setCampaignId(new AdCampaignIdentifier());
        adCampaign.setBusinessId(businessId);
        AdCampaign savedCampaign = adCampaignRepository.save(adCampaign);
        String campaignId = savedCampaign.getCampaignId().getCampaignId();
        String nonExistentAdId = "non-existent-ad-id";

        // Act & Assert
        webTestClient.delete()
                .uri(uriBuilder -> uriBuilder
                        .path(BASE_URI_AD_CAMPAIGNS + "/{campaignId}/ads/{adId}")
                        .build(businessId.getBusinessId(), campaignId, nonExistentAdId))
                .header("Authorization", "Bearer mock-token")
                .exchange()
                .expectStatus().isNotFound();
    }

}
