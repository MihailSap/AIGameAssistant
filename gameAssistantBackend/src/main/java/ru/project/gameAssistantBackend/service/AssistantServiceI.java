package ru.project.gameAssistantBackend.service;

import ru.project.gameAssistantBackend.models.Message;

import java.util.List;

public interface AssistantServiceI {

    String getAssistantAnswer(List<Message> messages);

    String buildRequestBody(List<Message> messages);

    String sendRequest(String jsonBody);

    String extractText(String assistantAnswer);

    String getAnswer(String prompt);
}
