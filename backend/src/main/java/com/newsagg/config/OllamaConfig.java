package com.newsagg.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import lombok.*;

@Component
@ConfigurationProperties(prefix = "ollama")
@Getter
@Setter
public class OllamaConfig {
    private String apiUrl = "http://localhost:11434";
    private String model = "llama2";
}
