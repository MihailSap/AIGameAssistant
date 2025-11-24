package ru.project.gameAssistantBackend.service;

import ru.project.gameAssistantBackend.models.Message;

import java.util.List;

public interface AIServiceI {

    String extractText(String assistantAnswer);

    String sendRequest(String jsonBody);

    String buildRequestBody(List<Message> messages);
}
