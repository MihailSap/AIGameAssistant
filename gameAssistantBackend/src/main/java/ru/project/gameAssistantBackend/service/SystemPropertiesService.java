package ru.project.gameAssistantBackend.service;

import ru.project.gameAssistantBackend.dto.chat.SystemPropertiesDTO;
import ru.project.gameAssistantBackend.models.SystemProperties;

public interface SystemPropertiesService {

    SystemProperties get();

    String getPromptText();

    SystemProperties updatePrompt(SystemPropertiesDTO systemPropertiesDTO);

    SystemPropertiesDTO mapToDTO(SystemProperties systemProperties);
}
