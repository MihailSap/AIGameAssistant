package ru.project.gameAssistantBackend.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.project.gameAssistantBackend.dto.game.GameRequestDTO;
import ru.project.gameAssistantBackend.models.Category;
import ru.project.gameAssistantBackend.models.Game;
import ru.project.gameAssistantBackend.repository.GameRepository;
import ru.project.gameAssistantBackend.service.GameServiceI;

import java.util.List;
import java.util.Set;

@Service
public class GameServiceImpl implements GameServiceI {

    private final GameRepository gameRepository;

    private final FileServiceImpl fileServiceImpl;

    private final Converter converter;

    private final CategoryService categoryService;

    @Autowired
    public GameServiceImpl(
            GameRepository gameRepository,
            FileServiceImpl fileServiceImpl,
            Converter converter,
            CategoryService categoryService) {
        this.gameRepository = gameRepository;
        this.fileServiceImpl = fileServiceImpl;
        this.converter = converter;
        this.categoryService = categoryService;
    }

    @Override
    public List<Game> getAll(){
        return gameRepository.findAll();
    }

    @Override
    public Game getById(Long id){
        return gameRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Игра с таким id не найдена"));
    }

    @Transactional
    @Override
    public Game create(GameRequestDTO gameRequestDTO){
        var game = new Game();
        game.setTitle(gameRequestDTO.title());
        game.setDescription(gameRequestDTO.description());

        List<String> categoryNames = gameRequestDTO.categories();
        Set<Category> categories = categoryService.getCategories(categoryNames);
        game.setCategories(categories);

        var imageFile = gameRequestDTO.imageFile();
        var imageFileTitle = fileServiceImpl.save(imageFile);
        game.setImageFileTitle(imageFileTitle);

        var rulesFile = gameRequestDTO.rulesFile();
        var rulesFileTitle = fileServiceImpl.save(rulesFile);
        game.setRulesFileTitle(rulesFileTitle);
        converter.convertPdfToMdAsync(rulesFileTitle);
        return gameRepository.save(game);
    }

    @Transactional
    @Override
    public Game update(Long id, GameRequestDTO gameRequestDTO){
        var game = getById(id);
        game.setTitle(gameRequestDTO.title());
        game.setDescription(gameRequestDTO.description());

        List<String> categoryNames = gameRequestDTO.categories();
        Set<Category> categories = categoryService.getCategories(categoryNames);
        game.setCategories(categories);

        var newImageFile = gameRequestDTO.imageFile();
        if(!newImageFile.isEmpty()){
            var oldImageFileTitle = game.getImageFileTitle();
            fileServiceImpl.delete(oldImageFileTitle);
            var newImageFileTitle = fileServiceImpl.save(newImageFile);
            game.setImageFileTitle(newImageFileTitle);
        }

        var newRulesFile = gameRequestDTO.rulesFile();
        if(!newRulesFile.isEmpty()){
            var oldRulesFileTitle = game.getRulesFileTitle();
            fileServiceImpl.delete(oldRulesFileTitle);
            var newRulesFileTitle = fileServiceImpl.save(newRulesFile);
            game.setRulesFileTitle(newRulesFileTitle);
        }

        return gameRepository.save(game);
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
}
