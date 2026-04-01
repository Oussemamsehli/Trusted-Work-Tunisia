package tn.esprit.reviewservice.config;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAPIConfig {

    @Bean
    public OpenAPI reviewServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("TrustedWork Review Service API")
                        .description("Documentation des APIs du module review-service")
                        .version("1.0"))
                .externalDocs(new ExternalDocumentation()
                        .description("TrustedWork Tunisia Project"));
    }
}