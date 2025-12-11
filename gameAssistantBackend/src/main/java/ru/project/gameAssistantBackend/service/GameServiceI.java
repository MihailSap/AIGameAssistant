package ru.project.gameAssistantBackend.service;

import ru.project.gameAssistantBackend.dto.game.GameRequestDTO;
import ru.project.gameAssistantBackend.exception.customEx.notFound.CategoryNotFoundException;
import ru.project.gameAssistantBackend.exception.customEx.notFound.GameNotFoundException;
import ru.project.gameAssistantBackend.models.Game;

import java.util.List;

public interface GameServiceI {

    List<Game> getAllGames();

    Game getGameById(Long id) throws GameNotFoundException;

    Game create(GameRequestDTO gameRequestDTO) throws CategoryNotFoundException;

    Game update(Long id, GameRequestDTO gameDTO) throws GameNotFoundException, CategoryNotFoundException;

    void delete(Long id) throws GameNotFoundException;
}
