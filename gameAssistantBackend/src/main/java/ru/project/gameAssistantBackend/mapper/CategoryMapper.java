package ru.project.gameAssistantBackend.mapper;

import org.springframework.stereotype.Component;
import ru.project.gameAssistantBackend.dto.category.CategoryResponseDTO;
import ru.project.gameAssistantBackend.models.Category;

import java.util.ArrayList;
import java.util.List;

@Component
public class CategoryMapper {

    public CategoryResponseDTO mapToCategoryResponseDTO(Category category) {
        return new CategoryResponseDTO(category.getId(), category.getName());
    }

    public List<CategoryResponseDTO> mapToCategoryResponseDTOs(List<Category> categories) {
        List<CategoryResponseDTO> categoryResponseDTOs = new ArrayList<>();
        for (Category category : categories) {
            categoryResponseDTOs.add(mapToCategoryResponseDTO(category));
        }
        return categoryResponseDTOs;
    }
}
