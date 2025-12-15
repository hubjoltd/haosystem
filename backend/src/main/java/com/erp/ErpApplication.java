package com.erp;

import com.erp.service.AuthService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class ErpApplication {
    public static void main(String[] args) {
        SpringApplication.run(ErpApplication.class, args);
    }
    
    @Bean
    CommandLineRunner initData(AuthService authService) {
        return args -> {
            authService.createDefaultAdmin();
        };
    }
}
