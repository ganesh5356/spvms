package com.example.svmps.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class DatabaseDiagnosticConfig {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseDiagnosticConfig.class);

    @Value("${spring.datasource.url:UNKNOWN}")
    private String url;

    @Value("${spring.datasource.username:UNKNOWN}")
    private String username;

    @PostConstruct
    public void init() {
        logger.info("--- SYSTEM ENVIRONMENT DIAGNOSTIC ---");
        Map<String, String> env = System.getenv();
        env.forEach((key, value) -> {
            if (key.startsWith("MYSQL") || key.startsWith("DATABASE") || key.startsWith("SPRING_DATASOURCE")) {
                logger.info("Env Var: {} = {}", key, maskValue(key, value));
            }
        });
        logger.info("Final spring.datasource.url = {}", maskUrl(url));
        logger.info("Final spring.datasource.username = {}", username);
        logger.info("------------------------------------");
    }

    private String maskValue(String key, String value) {
        if (value == null)
            return "null";
        if (key.contains("PASSWORD") || key.contains("URL")) {
            return value.length() > 5 ? value.substring(0, 5) + "****" : "****";
        }
        return value;
    }

    private String maskUrl(String url) {
        if (url == null)
            return "null";
        if (!url.contains("@"))
            return url;
        try {
            return url.replaceAll(":[^:@]+@", ":****@");
        } catch (Exception e) {
            return "MASK_ERROR";
        }
    }
}
