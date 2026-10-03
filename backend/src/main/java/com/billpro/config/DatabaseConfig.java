package com.billpro.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.io.File;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url:jdbc:sqlite:data/billpro.db}")
    private String configuredDatasourceUrl;

    @Bean
    @Primary
    public DataSource dataSource(DataSourceProperties properties) {
        String databaseUrl = System.getenv("DATABASE_URL");
        
        // 1. If explicit PostgreSQL URL is passed in DATABASE_URL
        if (databaseUrl != null && !databaseUrl.isBlank() && 
            (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://"))) {
            try {
                log.info("Configuring PostgreSQL DataSource from DATABASE_URL");
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

                HikariConfig hikariConfig = new HikariConfig();
                hikariConfig.setJdbcUrl(jdbcUrl);
                hikariConfig.setUsername(username);
                hikariConfig.setPassword(password);
                hikariConfig.setDriverClassName("org.postgresql.Driver");
                hikariConfig.setMaximumPoolSize(10);
                return new HikariDataSource(hikariConfig);
            } catch (Exception e) {
                log.warn("Failed to parse PostgreSQL DATABASE_URL, falling back to SQLite: {}", e.getMessage());
            }
        }

        // 2. Default SQLite Configuration
        String sqliteUrl = System.getenv("SPRING_DATASOURCE_URL");
        if (sqliteUrl == null || sqliteUrl.isBlank()) {
            sqliteUrl = configuredDatasourceUrl;
        }

        log.info("Configuring SQLite DataSource with URL: {}", sqliteUrl);

        // Ensure database directory exists
        try {
            if (sqliteUrl.startsWith("jdbc:sqlite:")) {
                String dbFilePath = sqliteUrl.substring("jdbc:sqlite:".length());
                // Remove optional query params if any
                if (dbFilePath.contains("?")) {
                    dbFilePath = dbFilePath.substring(0, dbFilePath.indexOf("?"));
                }
                File dbFile = new File(dbFilePath);
                File parentDir = dbFile.getParentFile();
                if (parentDir != null && !parentDir.exists()) {
                    boolean created = parentDir.mkdirs();
                    log.info("Created SQLite parent directory: {} (status: {})", parentDir.getAbsolutePath(), created);
                }
            }
        } catch (Exception e) {
            log.warn("Could not check/create SQLite directory: {}", e.getMessage());
        }

        HikariConfig hikariConfig = new HikariConfig();
        hikariConfig.setJdbcUrl(sqliteUrl);
        hikariConfig.setDriverClassName("org.sqlite.JDBC");
        hikariConfig.setMaximumPoolSize(5);
        hikariConfig.setConnectionTimeout(30000);
        // Enable WAL mode, busy timeout for concurrency, and foreign keys
        hikariConfig.setConnectionInitSql("PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000; PRAGMA synchronous = NORMAL; PRAGMA foreign_keys = ON;");

        return new HikariDataSource(hikariConfig);
    }
}
