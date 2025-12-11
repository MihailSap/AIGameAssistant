package ru.project.gameAssistantBackend.dto.chat;

import ru.project.gameAssistantBackend.models.Model;

public record SystemPropertiesDTO(String prompt, Model model) {
}
