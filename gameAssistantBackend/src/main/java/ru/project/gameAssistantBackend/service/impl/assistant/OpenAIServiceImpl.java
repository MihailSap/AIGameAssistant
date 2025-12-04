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

@Service("OPENAI")
public class OpenAIServiceImpl implements AssistantService {

    @Value("${openai.key}")
    private String apiKey;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Autowired
    public OpenAIServiceImpl(WebClient webClient, ObjectMapper objectMapper) {
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
                .uri("https://api.openai.com/v1/chat/completions")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(buildRequestBody(messages))
                .retrieve()
                .bodyToFlux(String.class)
                .map(this::extractStreamPart)
                .doOnNext(fullAnswer::append)
                .doOnComplete(() -> onComplete.accept(fullAnswer.toString()));
    }


    private String extractStreamPart(String jsonChunk) {
        try {
            JsonNode root = objectMapper.readTree(jsonChunk);
            JsonNode choices = root.path("choices");
            if (choices.isArray() && !choices.isEmpty()) {
                JsonNode delta = choices.get(0).path("delta");
                return delta.path("content").asText("");
            }
        } catch (Exception ignored) {}

        return "";
    }


    public Map<String, Object> buildRequestBody(List<Message> messages) {
        Map<String, Object> body = new HashMap<>();
        body.put("model", "gpt-4o-mini");
        body.put("temperature", 0.7);
        body.put("max_tokens", 2000);
        body.put("stream", true);

        List<Map<String, String>> openAiMessages = new ArrayList<>();
        for (Message message : messages) {
            openAiMessages.add(Map.of(
                    "role", message.getRole().name().toLowerCase(),
                    "content", message.getText()
            ));
        }
        body.put("messages", openAiMessages);

        return body;
    }
}
