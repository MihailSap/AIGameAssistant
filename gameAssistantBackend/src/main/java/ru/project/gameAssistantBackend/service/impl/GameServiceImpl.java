package ru.project.gameAssistantBackend.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.project.gameAssistantBackend.dto.game.GamePreviewDTO;
import ru.project.gameAssistantBackend.dto.game.GameRequestDTO;
import ru.project.gameAssistantBackend.dto.game.GameResponseDTO;
import ru.project.gameAssistantBackend.enums.GameCategory;
import ru.project.gameAssistantBackend.models.Game;
import ru.project.gameAssistantBackend.repository.GameRepository;
import ru.project.gameAssistantBackend.service.GameServiceI;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;

@Service
public class GameServiceImpl implements GameServiceI {

    private final GameRepository gameRepository;
    private final FileServiceImpl fileServiceImpl;
    private final Converter converter;

    @Autowired
    public GameServiceImpl(
            GameRepository gameRepository,
            FileServiceImpl fileServiceImpl,
            Converter converter) {
        this.gameRepository = gameRepository;
        this.fileServiceImpl = fileServiceImpl;
        this.converter = converter;
    }

    @Transactional
    @Override
    public GameResponseDTO create(GameRequestDTO gameRequestDTO){
        var game = new Game();
        game.setTitle(gameRequestDTO.title());
        game.setDescription(gameRequestDTO.description());
        game.setCategory(gameRequestDTO.category());

        var imageFile = gameRequestDTO.imageFile();
        var imageFileTitle = fileServiceImpl.save(imageFile);
        game.setImageFileTitle(imageFileTitle);

        var rulesFile = gameRequestDTO.rulesFile();
        var rulesFileTitle = fileServiceImpl.save(rulesFile);
        game.setRulesFileTitle(rulesFileTitle);
        converter.convertPdfToMdAsync(rulesFileTitle);
        gameRepository.save(game);
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
        game.setCategory(gameDTO.category());

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
                game.getCategory(),
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
                game.getCategory(),
                game.getImageFileTitle()
        );
    }

    @Override
    public String getRulesText(Long id) throws IOException {
        Game game = getById(id);
        String rulesFileTitle = game.getRulesFileTitle();
        return fileServiceImpl.extractTextFromMarkdown(rulesFileTitle);
    }

    @Override
    public List<GameCategory> getCategories(){
        return new ArrayList<>(Arrays.asList(GameCategory.values()));
    }
}
