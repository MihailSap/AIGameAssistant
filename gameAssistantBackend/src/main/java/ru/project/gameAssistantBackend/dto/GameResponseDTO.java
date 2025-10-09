package ru.project.gameAssistantBackend.dto;

public record GameResponseDTO(
        Long id,
        String title,
        String description,
        String imageFileTitle,
        String rulesFileTitle) {
}
