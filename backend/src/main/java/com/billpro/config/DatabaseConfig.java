package com.billpro.config;

import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    @Bean
    @Primary
    public DataSource dataSource(DataSourceProperties properties) {
        String databaseUrl = System.getenv("DATABASE_URL");
        if (databaseUrl != null && !databaseUrl.isBlank() && 
            (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://"))) {
            try {
                URI dbUri = new URI(databaseUrl);
                String userInfo = dbUri.getUserInfo();
                String username = "";
                String password = "";
                if (userInfo != null && userInfo.contains(":")) {
                    String[] parts = userInfo.split(":", 2);
                    username = parts[0];
                    password = parts[1];
                } else if (userInfo != null) {
                    username = userInfo;
                }

                int port = dbUri.getPort() == -1 ? 5432 : dbUri.getPort();
                String path = dbUri.getPath();
                String jdbcUrl = "jdbc:postgresql://" + dbUri.getHost() + ":" + port + path;

                return properties.initializeDataSourceBuilder()
                        .url(jdbcUrl)
                        .username(username)
                        .password(password)
                        .driverClassName("org.postgresql.Driver")
                        .build();
            } catch (Exception e) {
                // Fallback to standard Spring DataSourceProperties
            }
        }
        return properties.initializeDataSourceBuilder().build();
    }
}
