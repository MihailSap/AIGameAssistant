package ru.project.gameAssistantBackend.dto;

public record UserDTO(
        String email,
        String login,
        String password,
        boolean isAdmin) {
}
