package com.bezkoder.spring.security.jwt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling // Ajouter cette annotation

public class SpringSecurityRefreshTokenApplication {

	public static void main(String[] args) {
		SpringApplication.run(SpringSecurityRefreshTokenApplication.class, args);
	}

}
