package ru.project.gameAssistantBackend.dto;

public record UserResponseDTO(
        Long id,
        String email,
        String login,
        boolean isAdmin,
        String imageFileTitle) {
}
