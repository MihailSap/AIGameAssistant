package ru.project.gameAssistantBackend.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import ru.project.gameAssistantBackend.enums.ChatRole;
import ru.project.gameAssistantBackend.models.Message;

import java.util.List;

@Service
public class StreamAssistantService {

    private final AssistantServiceImpl assistantServiceImpl;

    @Value("${yandex-cloud.gpt.api-key}")
    private String apiKey;

    @Value("${yandex-cloud.gpt.api-url}")
    private String apiUrl;

    private final ObjectMapper objectMapper;

    private final WebClient webClient;

    @Autowired
    public StreamAssistantService(
            ObjectMapper objectMapper,
            WebClient webClient,
            AssistantServiceImpl assistantServiceImpl) {
        this.objectMapper = objectMapper;
        this.webClient = webClient;
        this.assistantServiceImpl = assistantServiceImpl;
    }

    public Flux<String> getStreamedAnswer(String prompt) {
        Message userMessage = new Message();
        userMessage.setRole(ChatRole.user);
        userMessage.setText(prompt);
        return webClient.post()
                .uri(apiUrl)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .header(HttpHeaders.AUTHORIZATION,
                        "Bearer " + (apiKey.startsWith("Api-Key ") ? apiKey.substring(8) : apiKey))
                .bodyValue(assistantServiceImpl.buildRequestBody(List.of(userMessage)))
                .retrieve()
                .bodyToFlux(String.class)
                .map(this::extractStreamPart);
    }

    private String extractStreamPart(String jsonChunk) {
        try {
            JsonNode root = objectMapper.readTree(jsonChunk);
            JsonNode alternatives = root
                    .path("result")
                    .path("alternatives");
            if (alternatives.isArray() && !alternatives.isEmpty()) {
                return alternatives.get(0)
                        .path("message")
                        .path("text")
                        .asText();
            }
        } catch (Exception ignored) {

        }
        return "";
    }
}