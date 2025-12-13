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
import ru.project.gameAssistantBackend.models.Message;
import ru.project.gameAssistantBackend.service.AssistantService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

@Service("YANDEX_GPT")
public class YandexGptServiceImpl implements AssistantService {

    @Value("${ai.yandex.key}")
    private String apiKey;

    @Value("${ai.yandex.url}")
    private String apiUrl;

    @Value("${ai.yandex.catalog-id}")
    private String catalogId;

    private final ObjectMapper objectMapper;

    private final WebClient webClient;

    @Autowired
    public YandexGptServiceImpl(
            ObjectMapper objectMapper,
            WebClient webClient) {
        this.objectMapper = objectMapper;
        this.webClient = webClient;
    }

    @Override
    public Flux<String> getStreamedAnswer(
            List<Message> messages,
            Consumer<String> onComplete
    ) {
        StringBuilder finalText = new StringBuilder();
        StringBuilder lastChunk = new StringBuilder();
        return webClient.post()
                .uri(apiUrl)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + normalizeApiKey(apiKey))
                .bodyValue(buildRequestBody(messages))
                .retrieve()
                .bodyToFlux(String.class)
                .map(this::extractStreamPart)
                .map(fullChunk -> {
                    String prev = lastChunk.toString();
                    lastChunk.setLength(0);
                    lastChunk.append(fullChunk);
                    if (fullChunk.startsWith(prev)) {
                        return fullChunk.substring(prev.length());
                    } else {
                        return fullChunk;
                    }
                })
                .doOnNext(finalText::append)
                .doOnComplete(() -> onComplete.accept(finalText.toString()));
    }

    private String normalizeApiKey(String key) {
        return key.startsWith("Api-Key ") ? key.substring(8) : key;
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

    private String buildRequestBody(List<Message> messages) {
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
}