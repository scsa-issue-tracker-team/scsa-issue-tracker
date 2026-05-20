package com.scsa.issuetracker.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SCSA Issue Tracker API")
                        .description("DS, DX, SDS 조직 공통 이슈 관리 시스템 API 문서")
                        .version("v1"));
    }
}
