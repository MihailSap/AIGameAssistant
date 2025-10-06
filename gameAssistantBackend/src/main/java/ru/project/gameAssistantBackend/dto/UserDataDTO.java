package ru.project.gameAssistantBackend.dto;

public record UserDataDTO(Long id, String email, String login, boolean isAdmin) {
}
