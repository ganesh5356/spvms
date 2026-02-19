package com.example.svmps;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableAsync
@EnableScheduling
@SpringBootApplication
public class SvmpsApplication {

	private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(SvmpsApplication.class);

	public static void main(String[] args) {
		logger.info("--- BOOTSTRAP ENVIRONMENT SCAN ---");
		System.getenv().forEach((k, v) -> {
			if (k.startsWith("MYSQL") || k.startsWith("DATABASE") || k.startsWith("SPRING_DATASOURCE")) {
				String masked = (k.contains("PASS") || k.contains("URL"))
						? (v.length() > 6 ? v.substring(0, 6) + "***" : "***")
						: v;
				logger.info("Env: {} = {}", k, masked);
			}
		});
		logger.info("----------------------------------");
		SpringApplication.run(SvmpsApplication.class, args);
	}

	@jakarta.annotation.PostConstruct
	public void init() {
		java.util.TimeZone.setDefault(java.util.TimeZone.getTimeZone("Asia/Kolkata"));
	}
}
