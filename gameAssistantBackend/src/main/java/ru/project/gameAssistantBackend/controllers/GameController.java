package ru.project.gameAssistantBackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.project.gameAssistantBackend.dto.game.GamePreviewDTO;
import ru.project.gameAssistantBackend.dto.game.GameRequestDTO;
import ru.project.gameAssistantBackend.dto.game.GameResponseDTO;
import ru.project.gameAssistantBackend.mapper.GameMapper;
import ru.project.gameAssistantBackend.models.Game;
import ru.project.gameAssistantBackend.service.impl.GameServiceImpl;

import java.util.List;

@RestController
@RequestMapping("/api/games")
public class GameController {

    private final GameServiceImpl gameServiceImpl;

    private final GameMapper gameMapper;

    @Autowired
    public GameController(GameServiceImpl gameServiceImpl, GameMapper gameMapper) {
        this.gameServiceImpl = gameServiceImpl;
        this.gameMapper = gameMapper;
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping
    public GameResponseDTO create(@ModelAttribute GameRequestDTO gameRequestDTO){
        Game game = gameServiceImpl.create(gameRequestDTO);
        return gameMapper.mapToGameResponseDTO(game);
    }

    @GetMapping("/{gameId}")
    public GameResponseDTO read(@PathVariable("gameId") Long gameId){
        Game game = gameServiceImpl.getById(gameId);
        return gameMapper.mapToGameResponseDTO(game);
    }

    @GetMapping
    public List<GamePreviewDTO> readAll(){
        List<Game> games = gameServiceImpl.getAll();
        return gameMapper.mapToGamePreviewDTOs(games);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping(value = "/{gameId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public GameResponseDTO update(@PathVariable("gameId") Long gameId, @ModelAttribute GameRequestDTO gameDTO){
        Game game = gameServiceImpl.update(gameId, gameDTO);
        return gameMapper.mapToGameResponseDTO(game);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{gameId}")
    public void delete(@PathVariable("gameId") Long gameId){
        gameServiceImpl.delete(gameId);
    }
}
