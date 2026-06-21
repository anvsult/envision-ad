package com.envisionad.webservice.appsettings.presentationlayer;

import com.envisionad.webservice.appsettings.dataaccesslayer.AppSetting;
import com.envisionad.webservice.appsettings.dataaccesslayer.AppSettingRepository;
import com.envisionad.webservice.appsettings.presentationlayer.models.AppSettingRequestModel;
import com.envisionad.webservice.appsettings.presentationlayer.models.AppSettingResponseModel;
import com.envisionad.webservice.config.BaseIntegrationTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

class AppSettingControllerIntegrationTest extends BaseIntegrationTest {

    private static final String BASE_URI = "/api/v1/settings";

    @Autowired
    private AppSettingRepository repository;

    @BeforeEach
    void setUp() {
        repository.deleteAll();

        Jwt adminJwt = Jwt.withTokenValue("mock-token")
                .header("alg", "none")
                .claim("sub", "auth0|admin123")
                .claim("permissions", List.of("manage:venues"))
                .build();
        when(jwtDecoder.decode(anyString())).thenReturn(adminJwt);
    }

    @Test
    void getByKey_existingSetting_returnsOk() {
        AppSetting setting = new AppSetting();
        setting.setKey("book-meeting-url");
        setting.setValue("https://calendly.com/test");
        repository.save(setting);

        webTestClient.get()
                .uri(BASE_URI + "/book-meeting-url")
                .exchange()
                .expectStatus().isOk()
                .expectBody(AppSettingResponseModel.class)
                .value(model -> {
                    assertEquals("book-meeting-url", model.getKey());
                    assertEquals("https://calendly.com/test", model.getValue());
                });
    }

    @Test
    void getByKey_missingSetting_returnsNotFound() {
        webTestClient.get()
                .uri(BASE_URI + "/nonexistent-key")
                .exchange()
                .expectStatus().isNotFound();
    }

    @Test
    void upsert_newSetting_withAdminAuth_returnsOk() {
        AppSettingRequestModel request = new AppSettingRequestModel();
        request.setValue("https://calendly.com/new");

        webTestClient.put()
                .uri(BASE_URI + "/book-meeting-url")
                .header("Authorization", "Bearer mock-token")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus().isOk()
                .expectBody(AppSettingResponseModel.class)
                .value(model -> {
                    assertEquals("book-meeting-url", model.getKey());
                    assertEquals("https://calendly.com/new", model.getValue());
                });

        assertTrue(repository.findById("book-meeting-url").isPresent());
    }

    @Test
    void upsert_existingSetting_withAdminAuth_updatesValue() {
        AppSetting existing = new AppSetting();
        existing.setKey("book-meeting-url");
        existing.setValue("https://calendly.com/old");
        repository.save(existing);

        AppSettingRequestModel request = new AppSettingRequestModel();
        request.setValue("https://calendly.com/updated");

        webTestClient.put()
                .uri(BASE_URI + "/book-meeting-url")
                .header("Authorization", "Bearer mock-token")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus().isOk()
                .expectBody(AppSettingResponseModel.class)
                .value(model -> assertEquals("https://calendly.com/updated", model.getValue()));
    }

    @Test
    void upsert_withoutAdminAuth_returnsForbidden() {
        when(jwtDecoder.decode(anyString())).thenReturn(
                Jwt.withTokenValue("mock-token")
                        .header("alg", "none")
                        .claim("sub", "auth0|user123")
                        .claim("permissions", List.of())
                        .build()
        );

        AppSettingRequestModel request = new AppSettingRequestModel();
        request.setValue("https://calendly.com/test");

        webTestClient.put()
                .uri(BASE_URI + "/book-meeting-url")
                .header("Authorization", "Bearer mock-token")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus().isForbidden();
    }
}
