package ru.project.gameAssistantBackend.dto.chat;

import java.util.List;

public record ChatDTO(Long id, List<MessageDTO> messageDTOs) {
}
