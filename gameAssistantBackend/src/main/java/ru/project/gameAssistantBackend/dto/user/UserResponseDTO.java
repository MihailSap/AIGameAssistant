package ru.project.gameAssistantBackend.dto.user;

import ru.project.gameAssistantBackend.models.Model;

public record UserResponseDTO(
        Long id,
        String email,
        String login,
        boolean isAdmin,
        String imageFileTitle,
        Model model) {
}
