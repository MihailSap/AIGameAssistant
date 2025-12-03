package ru.project.gameAssistantBackend.service;

import ru.project.gameAssistantBackend.dto.chat.PromptDTO;
import ru.project.gameAssistantBackend.models.Prompt;

public interface PromptServiceI {

    Prompt get();

    String getPromptText();

    Prompt update(PromptDTO promptDTO);

    PromptDTO mapToDTO(Prompt prompt);

    boolean isPromptExists();
}
