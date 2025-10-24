package ru.project.gameAssistantBackend.service;

import ru.project.gameAssistantBackend.dto.chat.PromptDTO;
import ru.project.gameAssistantBackend.models.Prompt;

public interface PromptServiceI {

    Prompt create(PromptDTO promptDTO);

    Prompt get();

    String getPromptText();

    Prompt update(PromptDTO promptDTO);

    void delete();

    PromptDTO mapToDTO(Prompt prompt);

    boolean isPromptExists();
}
