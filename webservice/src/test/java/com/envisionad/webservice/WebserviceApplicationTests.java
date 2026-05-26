package com.envisionad.webservice;

import com.envisionad.webservice.config.TestcontainersConfig;
import com.envisionad.webservice.utils.EmailService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
@Import(TestcontainersConfig.class)
class WebserviceApplicationTests {

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @MockitoBean
    private EmailService emailService;

    @Test
    void contextLoads() {
    }

}
