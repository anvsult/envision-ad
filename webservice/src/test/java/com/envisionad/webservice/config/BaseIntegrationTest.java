package com.envisionad.webservice.config;

import com.envisionad.webservice.utils.EmailService;
import org.junit.jupiter.api.parallel.ResourceLock;
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
 * share a single Spring ApplicationContext (and a single Testcontainers
 * PostgreSQL instance), which dramatically reduces build time.
 *
 * @ResourceLock("integration-db") ensures that integration test CLASSES
 * run sequentially against each other even when JUnit parallel-class
 * execution is enabled, preventing concurrent @BeforeEach cleanup from
 * wiping another class's seed data. Unit test classes (which do not
 * extend this class and have no DB) run freely in parallel.
 *
 * Rules for subclasses:
 *  - Do NOT redeclare @SpringBootTest, @Import(TestcontainersConfig.class),
 *    @MockitoBean JwtDecoder, @MockitoBean EmailService, or @Autowired WebTestClient.
 *  - Do NOT add extra @MockitoBean fields — each unique @MockitoBean combination
 *    forces Spring to create a separate context. Use real repository data instead.
 */
@SpringBootTest(webEnvironment = RANDOM_PORT)
@Import(TestcontainersConfig.class)
@ResourceLock("integration-db")
public abstract class BaseIntegrationTest {

    @MockitoBean
    protected JwtDecoder jwtDecoder;

    @MockitoBean
    protected EmailService emailService;

    @Autowired
    protected WebTestClient webTestClient;
}
