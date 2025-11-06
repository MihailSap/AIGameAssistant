package ru.project.gameAssistantBackend.dto.game;

import ru.project.gameAssistantBackend.enums.GameCategory;

public record GamePreviewDTO(
        Long id,
        String title,
        String description,
        GameCategory category,
        String imageFileTitle
) {
}
