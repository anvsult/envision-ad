package com.envisionad.webservice.advertisement.presentationlayer;

import com.envisionad.webservice.advertisement.dataaccesslayer.AdRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.reactive.server.WebTestClient;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

@SpringBootTest(webEnvironment = RANDOM_PORT, properties  = {"spring.datasource.url=jdbc:h2:mem:ad-db"})
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
public class AdControllerIntegrationTest {
    private final String BASE_URI_ADS = "/api/v1/ads";

    @Autowired
    private WebTestClient webTestClient;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Autowired
    private AdRepository adRepository;

    @BeforeEach
    void setUp() {
        Jwt jwt = Jwt.withTokenValue("mock-token")
                .header("alg", "none")
                .claim("sub", "auth0|65702e81e9661e14ab3aac89")
                .claim("scope", "read write")
                .claim("permissions", java.util.List.of("create:media", "update:media"))
                .build();
        when(jwtDecoder.decode(anyString())).thenReturn(jwt);
    }

    @Test
    void getAllAds_ShouldReturnAllAds() {
        webTestClient.get()
                .uri(BASE_URI_ADS)
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(Object.class);
    }




}
