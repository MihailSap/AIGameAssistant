package ru.project.gameAssistantBackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.project.gameAssistantBackend.dto.game.GamePreviewDTO;
import ru.project.gameAssistantBackend.dto.game.GameRequestDTO;
import ru.project.gameAssistantBackend.dto.game.GameResponseDTO;
import ru.project.gameAssistantBackend.service.impl.GameServiceImpl;

import java.util.List;

@RestController
@RequestMapping("/api/game")
public class GameController {

    private final GameServiceImpl gameServiceImpl;

    @Autowired
    public GameController(GameServiceImpl gameServiceImpl) {
        this.gameServiceImpl = gameServiceImpl;
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/create")
    public GameResponseDTO create(@ModelAttribute GameRequestDTO gameRequestDTO){
        return gameServiceImpl.create(gameRequestDTO);
    }

    @GetMapping("/{id}")
    public GameResponseDTO read(@PathVariable("id") Long id){
        return gameServiceImpl.getGameDTOById(id);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping(value = "/{id}/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public GameResponseDTO update(@PathVariable("id") Long id, @ModelAttribute GameRequestDTO gameDTO){
        return gameServiceImpl.update(id, gameDTO);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{id}/delete")
    public void delete(@PathVariable("id") Long id){
        gameServiceImpl.delete(id);
    }

    @GetMapping("/all")
    public List<GamePreviewDTO> readAll(){
        var games = gameServiceImpl.getAll();
        return gameServiceImpl.mapToPreviews(games);
    }
}
