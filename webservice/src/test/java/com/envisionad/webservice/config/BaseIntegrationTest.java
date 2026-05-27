package com.envisionad.webservice.config;

import com.envisionad.webservice.utils.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.reactive.server.WebTestClient;

import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

/**
 * Base class for all @SpringBootTest integration tests.
 * Centralises annotations and common mocks so that all subclasses
 * share a single Spring ApplicationContext (and therefore a single
 * Hikari connection pool), which dramatically reduces build time.
 *
 * Rules for subclasses:
 *  - Do NOT redeclare @SpringBootTest, @Import(TestcontainersConfig.class),
 *    @MockitoBean JwtDecoder, @MockitoBean EmailService, or @Autowired WebTestClient.
 *  - Additional @MockitoBean fields specific to one test class are fine and will
 *    cause Spring to create a separate context only for that class.
 */
@SpringBootTest(webEnvironment = RANDOM_PORT)
@Import(TestcontainersConfig.class)
public abstract class BaseIntegrationTest {

    @MockitoBean
    protected JwtDecoder jwtDecoder;

    @MockitoBean
    protected EmailService emailService;

    @Autowired
    protected WebTestClient webTestClient;
}
