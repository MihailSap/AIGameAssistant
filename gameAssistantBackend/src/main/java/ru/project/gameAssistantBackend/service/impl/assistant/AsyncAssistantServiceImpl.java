package ru.project.gameAssistantBackend.service.impl.assistant;

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

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

@Service
public class AsyncAssistantServiceImpl {

    @Value("${yandex-cloud.gpt.api-key}")
    private String apiKey;

    @Value("${yandex-cloud.gpt.api-url}")
    private String apiUrl;

    @Value("${yandex-cloud.gpt.catalog-id}")
    private String catalogId;

    private final ObjectMapper objectMapper;

    private final WebClient webClient;

    @Autowired
    public AsyncAssistantServiceImpl(
            ObjectMapper objectMapper,
            WebClient webClient) {
        this.objectMapper = objectMapper;
        this.webClient = webClient;
    }

    public Flux<String> getStreamedAnswer(
            List<Message> messages,
            Consumer<String> onComplete) {
        StringBuilder fullAnswer = new StringBuilder();
        return webClient.post()
                .uri(apiUrl)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + (apiKey.startsWith("Api-Key ")
                        ? apiKey.substring(8)
                        : apiKey))
                .bodyValue(buildRequestBody(messages))
                .retrieve()
                .bodyToFlux(String.class)
                .map(this::extractStreamPart)
                .doOnNext(chunk -> {
                    fullAnswer.setLength(0);
                    fullAnswer.append(chunk);
                })
                .doOnComplete(() -> onComplete.accept(fullAnswer.toString()));
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
        } catch (Exception ignored) { }
        return "";
    }

    public String buildRequestBody(List<Message> messages) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("modelUri", String.format("gpt://%s/yandexgpt-lite", catalogId));
            Map<String, Object> options = new HashMap<>();
            options.put("stream", true);
            options.put("temperature", 0.6);
            options.put("maxTokens", 2000);
            body.put("completionOptions", options);
            body.put("messages", messages);
            return objectMapper.writeValueAsString(body);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при формировании JSON-запроса", e);
        }
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
                .bodyValue(buildRequestBody(List.of(userMessage)))
                .retrieve()
                .bodyToFlux(String.class)
                .map(this::extractStreamPart);
    }
}