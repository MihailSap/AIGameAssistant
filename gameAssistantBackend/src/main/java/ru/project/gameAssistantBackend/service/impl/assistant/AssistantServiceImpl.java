package ru.project.gameAssistantBackend.service.impl.assistant;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import ru.project.gameAssistantBackend.models.ChatRole;
import ru.project.gameAssistantBackend.models.Message;
import ru.project.gameAssistantBackend.service.AssistantServiceI;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AssistantServiceImpl implements AssistantServiceI {

    @Value("${yandex-cloud.gpt.api-key}")
    private String apiKey;

    @Value("${yandex-cloud.gpt.api-url}")
    private String apiUrl;

    @Value("${yandex-cloud.gpt.catalog-id}")
    private String catalogId;

    private final RestTemplate restTemplate;

    private final ObjectMapper objectMapper;

    @Autowired
    public AssistantServiceImpl(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    public String getAssistantAnswer(List<Message> messages) {
        String jsonBody = buildRequestBody(messages);
        String rawResponse = sendRequest(jsonBody);
        return extractText(rawResponse);
    }

    @Override
    public String buildRequestBody(List<Message> messages) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("modelUri", String.format("gpt://%s/yandexgpt-lite", catalogId));
            Map<String, Object> options = new HashMap<>();
            options.put("stream", false);
            options.put("temperature", 0.6);
            options.put("maxTokens", 2000);
            body.put("completionOptions", options);
            body.put("messages", messages);
            return objectMapper.writeValueAsString(body);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при формировании JSON-запроса", e);
        }
    }

    @Override
    public String sendRequest(String jsonBody) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey.startsWith("Api-Key ") ? apiKey.substring(8) : apiKey);
        HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);
        ResponseEntity<String> response = restTemplate.exchange(
                apiUrl,
                HttpMethod.POST,
                entity,
                String.class
        );

        return response.getBody();
    }

    @Override
    public String extractText(String assistantAnswer){
        try {
            JsonNode root = objectMapper.readTree(assistantAnswer);
            return root
                    .path("result")
                    .path("alternatives")
                    .get(0)
                    .path("message")
                    .path("text")
                    .asText();
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при парсинге ответа: ", e);
        }
    }

    @Override
    public String getAnswer(String prompt) {
        Message userMessage = new Message();
        userMessage.setRole(ChatRole.user);
        userMessage.setText(prompt);
        return getAssistantAnswer(List.of(userMessage));
    }
}