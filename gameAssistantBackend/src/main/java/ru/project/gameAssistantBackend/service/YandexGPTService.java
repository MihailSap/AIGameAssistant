package ru.project.gameAssistantBackend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class YandexGPTService {

    @Value("${yandex-cloud.gpt.api-key}")
    private String apiKey;

    @Value("${yandex-cloud.gpt.catalog-id}")
    private String catalogId;

    public String getAnswer(String prompt) {
        var json = """
        {
            "modelUri": "gpt://%s/yandexgpt-lite",
            "completionOptions": {
                "stream": false,
                "temperature": 0.6,
                "maxTokens": "2000"
            },
            "messages": [
                {
                    "role": "user",
                    "text": "%s"
                }
            ]
        }
        """.formatted(catalogId, prompt);

        try {
            var client = HttpClient.newHttpClient();
            var request = HttpRequest.newBuilder()
                    .uri(URI.create("https://llm.api.cloud.yandex.net/foundationModels/v1/completion"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Api-Key " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            var response = client.send(request, HttpResponse.BodyHandlers.ofString());
            return response.body();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return "Не получилось обработать запрос";
    }
}
