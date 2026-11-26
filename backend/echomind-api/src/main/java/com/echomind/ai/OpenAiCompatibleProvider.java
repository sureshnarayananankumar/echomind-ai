package com.echomind.ai;

import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/** Calls any OpenAI-compatible /chat/completions endpoint. The key stays on the server. */
public class OpenAiCompatibleProvider implements AiProvider {
    private final RestClient client;
    private final String model;

    public OpenAiCompatibleProvider(String baseUrl, String apiKey, String model) {
        this.model = model;
        this.client = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();
    }

    @Override public String name() { return "OPENAI:" + model; }

    @Override public boolean isDemo() { return false; }

    @Override
    @SuppressWarnings("unchecked")
    public String chat(List<ChatTurn> history, String prompt) {
        List<Map<String, String>> messages = new ArrayList<>();
        history.forEach(t -> messages.add(Map.of("role", t.role(), "content", t.content())));
        messages.add(Map.of("role", "user", "content", prompt));

        Map<String, Object> response = client.post()
                .uri("/chat/completions")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("model", model, "messages", messages, "temperature", 0.4))
                .retrieve()
                .body(Map.class);

        var choices = (List<Map<String, Object>>) response.get("choices");
        var message = (Map<String, Object>) choices.get(0).get("message");
        return String.valueOf(message.get("content")).trim();
    }
}
