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

import java.util.*;
import java.util.function.Consumer;

@Service("MISTRAL")
public class MistralAssistantServiceImpl implements AssistantService {

    @Value("${ai.mistral.key}")
    private String apiKey;

    @Value("${ai.mistral.url}")
    private String apiUrl;

    private final WebClient webClient;

    private final ObjectMapper objectMapper;

    @Autowired
    public MistralAssistantServiceImpl(WebClient webClient, ObjectMapper objectMapper) {
        this.webClient = webClient;
        this.objectMapper = objectMapper;
    }

    @Override
    public Flux<String> getStreamedAnswer(
            List<Message> messages,
            Consumer<String> onComplete
    ) {
        StringBuilder fullAnswer = new StringBuilder();
        return webClient.post()
                .uri(apiUrl)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + normalizeApiKey(apiKey))
                .bodyValue(buildRequestBody(messages))
                .retrieve()
                .bodyToFlux(String.class)
                .map(this::extractStreamPart)
                .doOnNext(fullAnswer::append)
                .doOnComplete(() -> onComplete.accept(fullAnswer.toString()));
    }

    private String normalizeApiKey(String key) {
        if (key == null) return "";
        return key.startsWith("Bearer ") ? key.substring(7) : key;
    }

    private String extractStreamPart(String chunk) {
        try {
            if (chunk == null || chunk.isEmpty()) return "";
            if (chunk.startsWith("data: ")) {
                chunk = chunk.substring(6).trim();
            }
            if (chunk.equals("[DONE]")) return "";
            JsonNode root = objectMapper.readTree(chunk);
            JsonNode choices = root.path("choices");
            if (choices.isArray() && !choices.isEmpty()) {
                JsonNode delta = choices.get(0).path("delta");
                if (delta.has("content")) {
                    return delta.get("content").asText("");
                }
            }
        } catch (Exception ignored) { }
        return "";
    }

    private String buildRequestBody(List<Message> messages) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("model", "mistral-small-latest");
            body.put("stream", true);
            List<Map<String, String>> mistralMessages = new ArrayList<>();
            for (Message m : messages) {
                mistralMessages.add(Map.of(
                        "role", m.getRole().name().toLowerCase(),
                        "content", m.getText()
                ));
            }
            body.put("messages", mistralMessages);
            body.put("temperature", 0.7);
            body.put("max_tokens", 2000);
            return objectMapper.writeValueAsString(body);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при формировании JSON Mistral", e);
        }
    }
}
