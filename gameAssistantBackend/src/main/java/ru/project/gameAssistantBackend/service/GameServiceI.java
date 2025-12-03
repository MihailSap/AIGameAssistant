package ru.project.gameAssistantBackend.service;

import ru.project.gameAssistantBackend.dto.game.GameRequestDTO;
import ru.project.gameAssistantBackend.models.Game;

import java.util.List;

public interface GameServiceI {

    List<Game> getAll();

    Game getById(Long id);

    Game create(GameRequestDTO gameRequestDTO);

    Game update(Long id, GameRequestDTO gameDTO);

    void delete(Long id);
}
