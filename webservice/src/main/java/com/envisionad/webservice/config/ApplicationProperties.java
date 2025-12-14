package com.envisionad.webservice.config;

import lombok.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.ConstructorBinding;
import java.util.List;

@Value
@ConfigurationProperties(prefix = "application")
public class ApplicationProperties {

    List<String> clientOriginUrls;

    @ConstructorBinding
    public ApplicationProperties(final List<String> clientOriginUrls) {
        this.clientOriginUrls = clientOriginUrls;
    }

}