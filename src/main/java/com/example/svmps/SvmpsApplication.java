package com.example.svmps;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class SvmpsApplication {

	public static void main(String[] args) {
		SpringApplication.run(SvmpsApplication.class, args);
	}

}
