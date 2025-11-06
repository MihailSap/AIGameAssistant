package ru.project.gameAssistantBackend.dto.game;

import ru.project.gameAssistantBackend.enums.GameCategory;

public record GameResponseDTO(
        Long id,
        String title,
        String description,
        GameCategory category,
        String imageFileTitle,
        String rulesFileTitle
) {
}
