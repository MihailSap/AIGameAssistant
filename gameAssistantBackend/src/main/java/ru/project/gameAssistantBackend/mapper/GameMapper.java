package ru.project.gameAssistantBackend.mapper;

import org.springframework.stereotype.Component;
import ru.project.gameAssistantBackend.dto.game.GamePreviewDTO;
import ru.project.gameAssistantBackend.dto.game.GameResponseDTO;
import ru.project.gameAssistantBackend.models.Category;
import ru.project.gameAssistantBackend.models.Game;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Set;

@Component
public class GameMapper {

    public GameResponseDTO mapToGameResponseDTO(Game game){
        Set<Category> categories = game.getCategories();
        return new GameResponseDTO(
                game.getId(),
                game.getTitle(),
                game.getDescription(),
                mapToCategories(categories),
                game.getImageFileTitle(),
                game.getRulesFileTitle());
    }

    public List<GamePreviewDTO> mapToGamePreviewDTOs(Collection<Game> games){
        List<GamePreviewDTO> gamePreviewDTOs = new ArrayList<>();
        for(var game : games){
            gamePreviewDTOs.add(mapToGamePreviewDTO(game));
        }
        return gamePreviewDTOs;
    }

    public GamePreviewDTO mapToGamePreviewDTO(Game game){
        Set<Category> categories = game.getCategories();
        return new GamePreviewDTO(
                game.getId(),
                game.getTitle(),
                trimDesc(game.getDescription()),
                mapToCategories(categories),
                game.getImageFileTitle()
        );
    }

    public List<String> mapToCategories(Set<Category> categories){
        List<String> categoriesList = new ArrayList<>();
        for(Category category : categories){
            categoriesList.add(category.getName());
        }
        return categoriesList;
    }

    private String trimDesc(String desc){
        if (desc == null) return "";
        return desc.length() > 200 ? desc.substring(0,200) + "..." : desc;
    }
}
