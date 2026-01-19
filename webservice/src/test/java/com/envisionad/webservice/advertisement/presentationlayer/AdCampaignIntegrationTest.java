package com.envisionad.webservice.advertisement.presentationlayer;

import com.envisionad.webservice.advertisement.dataaccesslayer.*;
import com.envisionad.webservice.advertisement.presentationlayer.models.AdCampaignRequestModel;
import com.envisionad.webservice.advertisement.presentationlayer.models.AdRequestModel;
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
    private final String BASE_URI_AD_CAMPAIGNS = "/api/v1/ad-campaigns";

    @Autowired
    private WebTestClient webTestClient;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Autowired
    private AdCampaignRepository adCampaignRepository;

    @BeforeEach
    void setUp() {
        Jwt jwt = Jwt.withTokenValue("mock-token")
                .header("alg", "none")
                .claim("sub", "auth0|65702e81e9661e14ab3aac89")
                .claim("scope", "read write")
                .claim("permissions", java.util.List.of(
                        "create:campaign",
                        "update:campaign",
                        "read:campaign"
                ))
                .build();
        when(jwtDecoder.decode(anyString())).thenReturn(jwt);

        AdCampaign adCampaign = new AdCampaign();
        adCampaign.setName("Winter Sale");

        Ad ad = new Ad();
        ad.setName("Winter Discount");
        ad.setAdUrl("http://example.com/winter-discount");
        ad.setAdType(AdType.IMAGE);
        ad.setAdDurationSeconds(AdDuration.S10);

    }

    @Test
    void getAllCampaigns_shouldReturnAllCampaigns() {
        webTestClient.get()
                .uri(BASE_URI_AD_CAMPAIGNS)
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(Object.class);
    }

    @Test
    void createAdCampaign_shouldCreateNewCampaign() {
        // Arrange
        AdCampaignRequestModel requestModel = new AdCampaignRequestModel();
        requestModel.setName("Summer Sale");

        // Act & Assert
        webTestClient.post()
                .uri(BASE_URI_AD_CAMPAIGNS)
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth("mock-token"))
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
                        .build(campaignId))
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth("mock-token"))
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
                .uri(BASE_URI_AD_CAMPAIGNS)
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth("mock-token"))
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
                        .build(campaignId, adId))
                .headers(headers -> headers.setBearerAuth("mock-token"))
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
                        .build(campaignId))
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
                        .build(campaignId))
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
                        .build(nonExistentId))
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth("mock-token"))
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
                        .build(nonExistentCampaignId, adId))
                .headers(headers -> headers.setBearerAuth("mock-token"))
                .exchange()
                .expectStatus().isNotFound();
    }

    @Test
    void deleteNonExistingAdFromCampaign_shouldReturnAdNotFound() {
        // Arrange
        AdCampaign adCampaign = new AdCampaign();
        adCampaign.setName("Winter Sale");
        adCampaign.setCampaignId(new AdCampaignIdentifier());
        AdCampaign savedCampaign = adCampaignRepository.save(adCampaign);
        String campaignId = savedCampaign.getCampaignId().getCampaignId();
        String nonExistentAdId = "non-existent-ad-id";

        // Act & Assert
        webTestClient.delete()
                .uri(uriBuilder -> uriBuilder
                        .path(BASE_URI_AD_CAMPAIGNS + "/{campaignId}/ads/{adId}")
                        .build(campaignId, nonExistentAdId))
                .headers(headers -> headers.setBearerAuth("mock-token"))
                .exchange()
                .expectStatus().isNotFound();
    }

}
