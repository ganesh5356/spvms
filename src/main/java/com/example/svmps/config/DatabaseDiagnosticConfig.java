package com.example.svmps.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DatabaseDiagnosticConfig {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseDiagnosticConfig.class);

    @Value("${spring.datasource.url:UNKNOWN}")
    private String url;

    @Value("${spring.datasource.username:UNKNOWN}")
    private String username;

    @Bean
    public CommandLineRunner diagnosticRunner() {
        return args -> {
            logger.info("--- Database Connection Diagnostic ---");
            logger.info("Target URL: {}", maskUrl(url));
            logger.info("Target User: {}", username);
            logger.info("--------------------------------------");
        };
    }

    private String maskUrl(String url) {
        if (url == null || !url.contains("@"))
            return url;
        try {
            // Mask password in jdbc:mysql://user:pass@host:port/db format if present
            return url.replaceAll(":[^:@]+@", ":****@");
        } catch (Exception e) {
            return "MASK_ERROR";
        }
    }
}
