package com.sfourtraders;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {
        "com.sfourtraders",
        "com.sfourtraders.config",
        "com.sfourtraders.controller",
        "com.sfourtraders.service",
        "com.sfourtraders.repository",
        "com.sfourtraders.model"
})
public class InvoiceBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(InvoiceBackendApplication.class, args);
    }
}