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
@RequestMapping("/api/game")
public class GameController {

    private final GameServiceImpl gameServiceImpl;

    private final GameMapper gameMapper;

    @Autowired
    public GameController(GameServiceImpl gameServiceImpl, GameMapper gameMapper) {
        this.gameServiceImpl = gameServiceImpl;
        this.gameMapper = gameMapper;
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/create")
    public GameResponseDTO create(@ModelAttribute GameRequestDTO gameRequestDTO){
        Game game = gameServiceImpl.create(gameRequestDTO);
        return gameMapper.mapToGameResponseDTO(game);
    }

    @GetMapping("/{id}")
    public GameResponseDTO read(@PathVariable("id") Long id){
        Game game = gameServiceImpl.getById(id);
        return gameMapper.mapToGameResponseDTO(game);
    }

    @GetMapping("/all")
    public List<GamePreviewDTO> readAll(){
        List<Game> games = gameServiceImpl.getAll();
        return gameMapper.mapToGamePreviewDTOs(games);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping(value = "/{id}/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public GameResponseDTO update(@PathVariable("id") Long id, @ModelAttribute GameRequestDTO gameDTO){
        Game game = gameServiceImpl.update(id, gameDTO);
        return gameMapper.mapToGameResponseDTO(game);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{id}/delete")
    public void delete(@PathVariable("id") Long id){
        gameServiceImpl.delete(id);
    }
}
