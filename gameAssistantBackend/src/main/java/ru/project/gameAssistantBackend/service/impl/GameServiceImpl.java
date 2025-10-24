package ru.project.gameAssistantBackend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.project.gameAssistantBackend.dto.game.GamePreviewDTO;
import ru.project.gameAssistantBackend.dto.game.GameRequestDTO;
import ru.project.gameAssistantBackend.dto.game.GameResponseDTO;
import ru.project.gameAssistantBackend.models.Game;
import ru.project.gameAssistantBackend.repository.GameRepository;
import ru.project.gameAssistantBackend.service.GameServiceI;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameServiceImpl implements GameServiceI {

    private final GameRepository gameRepository;
    private final FileServiceImpl fileServiceImpl;

    @Transactional
    @Override
    public GameResponseDTO create(GameRequestDTO gameRequestDTO){
        var game = new Game();
        game.setTitle(gameRequestDTO.title());
        game.setDescription(gameRequestDTO.description());

        var imageFile = gameRequestDTO.imageFile();
        var imageFileTitle = fileServiceImpl.save(imageFile);
        game.setImageFileTitle(imageFileTitle);

        var rulesFile = gameRequestDTO.rulesFile();
        var rulesFileTitle = fileServiceImpl.save(rulesFile);
        game.setRulesFileTitle(rulesFileTitle);

        gameRepository.save(game);
        log.info("Игра создана");
        return mapToDTO(game);
    }

    @Override
    public GameResponseDTO getGameDTOById(Long id){
        var game = getById(id);
        return mapToDTO(game);
    }

    @Transactional
    @Override
    public GameResponseDTO update(Long id, GameRequestDTO gameDTO){
        var game = getById(id);
        game.setTitle(gameDTO.title());
        game.setDescription(gameDTO.description());

        var newImageFile = gameDTO.imageFile();
        if(!newImageFile.isEmpty()){
            var oldImageFileTitle = game.getImageFileTitle();
            fileServiceImpl.delete(oldImageFileTitle);
            var newImageFileTitle = fileServiceImpl.save(newImageFile);
            game.setImageFileTitle(newImageFileTitle);
        }

        var newRulesFile = gameDTO.rulesFile();
        if(!newRulesFile.isEmpty()){
            var oldRulesFileTitle = game.getRulesFileTitle();
            fileServiceImpl.delete(oldRulesFileTitle);
            var newRulesFileTitle = fileServiceImpl.save(newRulesFile);
            game.setRulesFileTitle(newRulesFileTitle);
        }

        gameRepository.save(game);
        log.info("Игра с id {} была обновлена", id);
        return mapToDTO(game);
    }

    @Transactional
    @Override
    public void delete(Long id){
        var game = getById(id);
        var imageFileTitle = game.getImageFileTitle();
        var rulesFileTitle = game.getRulesFileTitle();
        fileServiceImpl.delete(imageFileTitle);
        fileServiceImpl.delete(rulesFileTitle);
        gameRepository.delete(game);
        log.info("Игра с id={} была удалена", id);
    }

    @Override
    public List<Game> getAll(){
        return gameRepository.findAll();
    }

    @Override
    public List<GameResponseDTO> mapToDTOs(List<Game> games){
        List<GameResponseDTO> gameDTOs = new ArrayList<>();
        for (var game : games){
            gameDTOs.add(mapToDTO(game));
        }
        return gameDTOs;
    }

    @Override
    public Game getById(Long id){
        return gameRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Игра с таким id не найдена"));
    }

    @Override
    public GameResponseDTO mapToDTO(Game game){
        return new GameResponseDTO(
                game.getId(),
                game.getTitle(),
                game.getDescription(),
                game.getImageFileTitle(),
                game.getRulesFileTitle());
    }

    @Override
    public List<GamePreviewDTO> mapToPreviews(Collection<Game> games){
        List<GamePreviewDTO> gamePreviewDTOs = new ArrayList<>();
        for(var game : games){
            gamePreviewDTOs.add(mapToPreview(game));
        }
        return gamePreviewDTOs;
    }

    @Override
    public GamePreviewDTO mapToPreview(Game game){
        return new GamePreviewDTO(
                game.getId(),
                game.getTitle(),
                game.getDescription(),
                game.getImageFileTitle()
        );
    }

    @Override
    public String getRulesText(Long id) throws IOException {
        Game game = getById(id);
        String rulesFileTitle = game.getRulesFileTitle();
        return fileServiceImpl.extractTextFromPDF(rulesFileTitle);
    }
}
