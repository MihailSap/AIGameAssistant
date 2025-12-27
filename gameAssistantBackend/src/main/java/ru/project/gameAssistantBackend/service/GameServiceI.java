package ru.project.gameAssistantBackend.service;

import org.springframework.data.domain.Page;
import ru.project.gameAssistantBackend.dto.game.GameRequestDTO;
import ru.project.gameAssistantBackend.exception.customEx.notFound.CategoryNotFoundException;
import ru.project.gameAssistantBackend.exception.customEx.notFound.GameNotFoundException;
import ru.project.gameAssistantBackend.models.Game;
import ru.project.gameAssistantBackend.models.SortDirection;

public interface GameServiceI {

    Page<Game> getPagedGames(
            int page, int size, String filter, String category, String sortBy, SortDirection direction);

    Game getGameById(Long id) throws GameNotFoundException;

    Game create(GameRequestDTO gameRequestDTO) throws CategoryNotFoundException;

    Game update(Long id, GameRequestDTO gameDTO) throws GameNotFoundException, CategoryNotFoundException;

    void delete(Long id) throws GameNotFoundException;
}
