package ru.project.gameAssistantBackend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.project.gameAssistantBackend.dto.GameRequestDTO;
import ru.project.gameAssistantBackend.dto.GameResponseDTO;
import ru.project.gameAssistantBackend.models.Game;
import ru.project.gameAssistantBackend.repository.GameRepository;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameService {

    private final GameRepository gameRepository;
    private final FileService fileService;

    @Transactional
    public GameResponseDTO create(GameRequestDTO gameRequestDTO){
        var game = new Game();
        game.setTitle(gameRequestDTO.title());
        game.setDescription(gameRequestDTO.description());

        var imageFile = gameRequestDTO.imageFile();
        var imageFileTitle = fileService.save(imageFile);
        game.setImageFileTitle(imageFileTitle);

        var rulesFile = gameRequestDTO.rulesFile();
        var rulesFileTitle = fileService.save(rulesFile);
        game.setRulesFileTitle(rulesFileTitle);

        gameRepository.save(game);
        log.info("Игра создана");
        return mapToDTO(game);
    }

    public GameResponseDTO getGameDTOById(Long id){
        var game = getById(id);
        return mapToDTO(game);
    }

    @Transactional
    public GameResponseDTO update(Long id, GameRequestDTO gameDTO){
        var game = getById(id);
        game.setTitle(gameDTO.title());
        game.setDescription(gameDTO.description());

        var oldImageFileTitle = game.getImageFileTitle();
        fileService.delete(oldImageFileTitle);

        var oldRulesFileTitle = game.getRulesFileTitle();
        fileService.delete(oldRulesFileTitle);

        var newImageFile = gameDTO.imageFile();
        var newImageFileTitle = fileService.save(newImageFile);
        game.setImageFileTitle(newImageFileTitle);

        var newRulesFile = gameDTO.rulesFile();
        var newRulesFileTitle = fileService.save(newRulesFile);
        game.setRulesFileTitle(newRulesFileTitle);

        gameRepository.save(game);
        log.info("Игра с id {} была обновлена", id);
        return mapToDTO(game);
    }

    @Transactional
    public void delete(Long id){
        var game = getById(id);
        var imageFileTitle = game.getImageFileTitle();
        var rulesFileTitle = game.getRulesFileTitle();
        fileService.delete(imageFileTitle);
        fileService.delete(rulesFileTitle);
        gameRepository.delete(game);
        log.info("Игра с id={} была удалена", id);
    }

    public List<Game> getAll(){
        return gameRepository.findAll();
    }

    public List<GameResponseDTO> mapToDTOs(List<Game> games){
        List<GameResponseDTO> gameDTOs = new ArrayList<>();
        for (var game : games){
            gameDTOs.add(mapToDTO(game));
        }
        return gameDTOs;
    }

    public Game getById(Long id){
        return gameRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Игра с таким id не найдена"));
    }

    public GameResponseDTO mapToDTO(Game game){
        return new GameResponseDTO(
                game.getId(),
                game.getTitle(),
                game.getDescription(),
                game.getImageFileTitle(),
                game.getRulesFileTitle());
    }
}
