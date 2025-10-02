package ru.project.gameAssistantBackend.dto;

import org.springframework.web.multipart.MultipartFile;

public record GameRequestDTO(String title, String description, MultipartFile imageFile, MultipartFile rulesFile) {
}
