package ru.project.gameAssistantBackend.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.project.gameAssistantBackend.dto.game.GamePreviewDTO;
import ru.project.gameAssistantBackend.dto.game.GameRequestDTO;
import ru.project.gameAssistantBackend.dto.game.GameResponseDTO;
import ru.project.gameAssistantBackend.service.GameService;

import java.util.List;

@RestController
@RequestMapping("/api/game")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/create")
    public GameResponseDTO create(@ModelAttribute GameRequestDTO gameRequestDTO){
        return gameService.create(gameRequestDTO);
    }

    @GetMapping("/{id}")
    public GameResponseDTO read(@PathVariable("id") Long id){
        return gameService.getGameDTOById(id);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping(value = "/{id}/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public GameResponseDTO update(@PathVariable("id") Long id, @ModelAttribute GameRequestDTO gameDTO){
        return gameService.update(id, gameDTO);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{id}/delete")
    public void delete(@PathVariable("id") Long id){
        gameService.delete(id);
    }

    @GetMapping("/all")
    public List<GamePreviewDTO> readAll(){
        var games = gameService.getAll();
        return gameService.mapToPreviews(games);
    }
}
