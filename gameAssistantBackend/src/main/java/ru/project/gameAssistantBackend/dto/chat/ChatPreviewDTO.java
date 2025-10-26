package ru.project.gameAssistantBackend.dto.chat;

import java.time.Instant;

public record ChatPreviewDTO(Long id, String title, Instant lastUseTime) {
}
