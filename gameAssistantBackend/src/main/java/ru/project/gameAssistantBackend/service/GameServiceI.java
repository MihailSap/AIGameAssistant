package ru.project.gameAssistantBackend.service;

import ru.project.gameAssistantBackend.dto.game.GamePreviewDTO;
import ru.project.gameAssistantBackend.dto.game.GameRequestDTO;
import ru.project.gameAssistantBackend.dto.game.GameResponseDTO;
import ru.project.gameAssistantBackend.models.Game;

import java.io.IOException;
import java.util.Collection;
import java.util.List;

public interface GameServiceI {

    GameResponseDTO create(GameRequestDTO gameRequestDTO);

    GameResponseDTO getGameDTOById(Long id);

    GameResponseDTO update(Long id, GameRequestDTO gameDTO);

    void delete(Long id);

    List<Game> getAll();

    List<GameResponseDTO> mapToDTOs(List<Game> games);

    Game getById(Long id);

    GameResponseDTO mapToDTO(Game game);

    List<GamePreviewDTO> mapToPreviews(Collection<Game> games);

    GamePreviewDTO mapToPreview(Game game);

    String getRulesText(Long id) throws IOException;
}
