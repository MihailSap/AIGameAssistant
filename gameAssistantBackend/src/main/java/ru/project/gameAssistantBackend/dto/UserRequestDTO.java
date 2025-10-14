package ru.project.gameAssistantBackend.dto;

import org.springframework.web.multipart.MultipartFile;

public record UserRequestDTO(
        String email,
        String login,
        String password,
        Boolean isAdmin,
        MultipartFile imageFile) {
}
