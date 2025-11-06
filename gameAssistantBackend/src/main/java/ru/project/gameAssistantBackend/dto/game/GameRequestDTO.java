package ru.project.gameAssistantBackend.dto.game;

import org.springframework.web.multipart.MultipartFile;
import ru.project.gameAssistantBackend.enums.GameCategory;

public record GameRequestDTO(
        String title,
        String description,
        GameCategory category,
        MultipartFile imageFile,
        MultipartFile rulesFile
) {
}
