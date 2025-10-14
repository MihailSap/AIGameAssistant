package ru.project.gameAssistantBackend.dto.game;

public record GamePreviewDTO(
        Long id,
        String title,
        String description,
        String imageFileTitle
) {
}
