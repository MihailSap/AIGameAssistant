package ru.project.gameAssistantBackend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.project.gameAssistantBackend.dto.game.GamePreviewDTO;
import ru.project.gameAssistantBackend.dto.game.GameRequestDTO;
import ru.project.gameAssistantBackend.dto.game.GameResponseDTO;
import ru.project.gameAssistantBackend.models.Game;
import ru.project.gameAssistantBackend.repository.GameRepository;

import java.util.ArrayList;
import java.util.Collection;
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

        var newImageFile = gameDTO.imageFile();
        if(!newImageFile.isEmpty()){
            var oldImageFileTitle = game.getImageFileTitle();
            fileService.delete(oldImageFileTitle);
            var newImageFileTitle = fileService.save(newImageFile);
            game.setImageFileTitle(newImageFileTitle);
        }

        var newRulesFile = gameDTO.rulesFile();
        if(!newRulesFile.isEmpty()){
            var oldRulesFileTitle = game.getRulesFileTitle();
            fileService.delete(oldRulesFileTitle);
            var newRulesFileTitle = fileService.save(newRulesFile);
            game.setRulesFileTitle(newRulesFileTitle);
        }

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

    public List<GamePreviewDTO> mapToPreviews(Collection<Game> games){
        List<GamePreviewDTO> gamePreviewDTOs = new ArrayList<>();
        for(var game : games){
            gamePreviewDTOs.add(mapToPreview(game));
        }
        return gamePreviewDTOs;
    }

    public GamePreviewDTO mapToPreview(Game game){
        return new GamePreviewDTO(
                game.getId(),
                game.getTitle(),
                game.getDescription(),
                game.getImageFileTitle()
        );
    }
}
