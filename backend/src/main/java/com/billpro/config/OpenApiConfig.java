package com.billpro.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("BillPro REST API Documentation")
                        .version("1.0.0-MVP")
                        .description("Smart Billing & Business Management System API for SHREYANS SRS588 58mm Thermal Printer")
                        .contact(new Contact().name("BillPro Team").email("support@billpro.com")));
    }
}
