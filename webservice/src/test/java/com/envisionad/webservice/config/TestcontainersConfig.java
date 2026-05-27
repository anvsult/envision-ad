package com.envisionad.webservice.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.containers.PostgreSQLContainer;

@TestConfiguration(proxyBeanMethods = false)
public class TestcontainersConfig {

    private static final PostgreSQLContainer<?> postgres;

    static {
        // Override Docker API version to satisfy OrbStack/Docker Engine 29.x (min API 1.40)
        // Testcontainers' shaded docker-java uses property key "api.version" (not DOCKER_API_VERSION)
        postgres = new PostgreSQLContainer<>("postgres:15");
        postgres.start();
    }

    @Bean
    @ServiceConnection
    public PostgreSQLContainer<?> postgresContainer() {
        return postgres;
    }
}
