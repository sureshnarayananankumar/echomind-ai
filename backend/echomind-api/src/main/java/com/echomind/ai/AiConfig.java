package com.echomind.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfig {
    @Bean
    AiProvider aiProvider(@Value("${echomind.ai.provider}") String provider,
                          @Value("${echomind.ai.base-url}") String baseUrl,
                          @Value("${echomind.ai.api-key}") String apiKey,
                          @Value("${echomind.ai.model}") String model) {
        if ("OPENAI".equalsIgnoreCase(provider) && !apiKey.isBlank()) {
            return new OpenAiCompatibleProvider(baseUrl, apiKey, model);
        }
        return new DemoAiProvider();
    }
}
