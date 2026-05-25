package com.envisionad.webservice.venue.presentationlayer;

import com.envisionad.webservice.venue.dataaccesslayer.Venue;
import com.envisionad.webservice.venue.dataaccesslayer.VenueRepository;
import com.envisionad.webservice.venue.presentationlayer.models.VenueRequestModel;
import com.envisionad.webservice.venue.presentationlayer.models.VenueResponseModel;
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

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

@SpringBootTest(webEnvironment = RANDOM_PORT, properties = {
        "spring.datasource.url=jdbc:h2:mem:venue-db",
        "spring.sql.init.mode=never"
})
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class VenueControllerIntegrationTest {

    private static final String BASE_URI = "/api/v1/venues";

    @Autowired
    private WebTestClient webTestClient;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Autowired
    private VenueRepository venueRepository;

    private Venue savedVenue;

    @BeforeEach
    void setUp() {
        Jwt adminJwt = Jwt.withTokenValue("mock-token")
                .header("alg", "none")
                .claim("sub", "auth0|admin123")
                .claim("permissions", List.of("manage:venues"))
                .build();
        when(jwtDecoder.decode(anyString())).thenReturn(adminJwt);

        Venue venue = new Venue();
        venue.setVenueId("test-venue-id-1");
        venue.setNameEn("Barbershop");
        venue.setNameFr("Salon de coiffure");
        venue.setColorCode("#FF5733");
        savedVenue = venueRepository.save(venue);
    }

    @Test
    void getAllVenues_returnsOkWithVenues() {
        webTestClient.get()
                .uri(BASE_URI)
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(VenueResponseModel.class)
                .hasSize(1)
                .value(venues -> {
                    assertEquals("Barbershop", venues.get(0).getNameEn());
                    assertEquals("#FF5733", venues.get(0).getColorCode());
                });
    }

    @Test
    void getAllVenues_withFrLocale_returnsOrderedByFrenchName() {
        Venue venue2 = new Venue();
        venue2.setVenueId("test-venue-id-2");
        venue2.setNameEn("Gym");
        venue2.setNameFr("Gymnase");
        venue2.setColorCode("#3366FF");
        venueRepository.save(venue2);

        webTestClient.get()
                .uri(BASE_URI + "?locale=fr")
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(VenueResponseModel.class)
                .hasSize(2)
                .value(venues -> {
                    assertEquals("Gymnase", venues.get(0).getNameFr());
                    assertEquals("Salon de coiffure", venues.get(1).getNameFr());
                });
    }

    @Test
    void getVenueByVenueId_existingVenue_returnsOk() {
        webTestClient.get()
                .uri(BASE_URI + "/{venueId}", savedVenue.getVenueId())
                .exchange()
                .expectStatus().isOk()
                .expectBody(VenueResponseModel.class)
                .value(venue -> {
                    assertEquals("Barbershop", venue.getNameEn());
                    assertEquals(savedVenue.getVenueId(), venue.getVenueId());
                });
    }

    @Test
    void getVenueByVenueId_nonExistingVenue_returnsNotFound() {
        webTestClient.get()
                .uri(BASE_URI + "/{venueId}", "non-existent-id")
                .exchange()
                .expectStatus().isNotFound();
    }

    @Test
    void createVenue_withAdminAuth_returnsCreated() {
        VenueRequestModel request = new VenueRequestModel();
        request.setNameEn("College");
        request.setNameFr("Collège");
        request.setColorCode("#00FF00");

        webTestClient.post()
                .uri(BASE_URI)
                .header("Authorization", "Bearer mock-token")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(VenueResponseModel.class)
                .value(venue -> {
                    assertNotNull(venue.getVenueId());
                    assertEquals("College", venue.getNameEn());
                    assertEquals("Collège", venue.getNameFr());
                    assertEquals("#00FF00", venue.getColorCode());
                    assertEquals(0, venue.getMediaCount());
                });
    }

    @Test
    void createVenue_withoutAuth_returnsUnauthorized() {
        when(jwtDecoder.decode(anyString())).thenReturn(
                Jwt.withTokenValue("mock-token")
                        .header("alg", "none")
                        .claim("sub", "auth0|user123")
                        .claim("permissions", List.of())
                        .build()
        );

        VenueRequestModel request = new VenueRequestModel();
        request.setNameEn("College");
        request.setNameFr("Collège");
        request.setColorCode("#00FF00");

        webTestClient.post()
                .uri(BASE_URI)
                .header("Authorization", "Bearer mock-token")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus().isForbidden();
    }

    @Test
    void updateVenue_withAdminAuth_returnsOk() {
        VenueRequestModel request = new VenueRequestModel();
        request.setNameEn("Barber Shop Updated");
        request.setNameFr("Salon de coiffure mis à jour");
        request.setColorCode("#AABBCC");

        webTestClient.put()
                .uri(BASE_URI + "/{venueId}", savedVenue.getVenueId())
                .header("Authorization", "Bearer mock-token")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus().isOk()
                .expectBody(VenueResponseModel.class)
                .value(venue -> {
                    assertEquals("Barber Shop Updated", venue.getNameEn());
                    assertEquals("#AABBCC", venue.getColorCode());
                });
    }

    @Test
    void deleteVenue_withAdminAuth_returnsNoContent() {
        webTestClient.delete()
                .uri(BASE_URI + "/{venueId}", savedVenue.getVenueId())
                .header("Authorization", "Bearer mock-token")
                .exchange()
                .expectStatus().isNoContent();

        assertFalse(venueRepository.findByVenueId(savedVenue.getVenueId()).isPresent());
    }

    @Test
    void deleteVenue_nonExistingVenue_returnsNotFound() {
        webTestClient.delete()
                .uri(BASE_URI + "/{venueId}", "non-existent-id")
                .header("Authorization", "Bearer mock-token")
                .exchange()
                .expectStatus().isNotFound();
    }

    @Test
    void getMediaCount_withAdminAuth_returnsZero() {
        webTestClient.get()
                .uri(BASE_URI + "/{venueId}/media-count", savedVenue.getVenueId())
                .header("Authorization", "Bearer mock-token")
                .exchange()
                .expectStatus().isOk()
                .expectBody(Long.class)
                .value(count -> assertEquals(0L, count));
    }
}
