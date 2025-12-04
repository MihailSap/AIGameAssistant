package ru.project.gameAssistantBackend.dto.chat;

import ru.project.gameAssistantBackend.enums.Model;

public record SystemPropertiesDTO(String prompt, Model model) {
}
