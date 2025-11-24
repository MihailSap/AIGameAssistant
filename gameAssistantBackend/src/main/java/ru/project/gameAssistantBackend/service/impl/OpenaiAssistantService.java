package ru.project.gameAssistantBackend.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import ru.project.gameAssistantBackend.models.Message;
import ru.project.gameAssistantBackend.service.AIServiceI;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OpenaiAssistantService implements AIServiceI {

    @Value("${openai.key}")
    private String apiKey;

    private final RestTemplate restTemplate;

    private final ObjectMapper objectMapper;

    @Autowired
    public OpenaiAssistantService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }


    public String getAssistantAnswer(List<Message> messages) {
        String jsonBody = buildRequestBody(messages);
        String rawResponse = sendRequest(jsonBody);
        return extractText(rawResponse);
    }

    @Override
    public String buildRequestBody(List<Message> messages) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("model", "gpt-4o-mini");
            List<Map<String, String>> openAiMessages = new ArrayList<>();
            for (Message message : messages) {
                openAiMessages.add(Map.of(
                        "role", message.getRole().name().toLowerCase(),
                        "content", message.getText()
                ));
            }
            body.put("messages", openAiMessages);
            body.put("temperature", 0.7);
            body.put("max_tokens", 2000);
            body.put("stream", false);
            return objectMapper.writeValueAsString(body);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при формировании JSON-запроса для OpenAI", e);
        }
    }

    @Override
    public String sendRequest(String jsonBody) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);
        ResponseEntity<String> response = restTemplate.exchange(
                "https://api.openai.com/v1/chat/completions",
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
                    .path("choices")
                    .get(0)
                    .path("message")
                    .path("content")
                    .asText();
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при парсинге ответа OpenAI", e);
        }
    }
}
