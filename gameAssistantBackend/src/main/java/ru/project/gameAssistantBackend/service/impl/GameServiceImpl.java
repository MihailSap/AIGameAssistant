package ru.project.gameAssistantBackend.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ru.project.gameAssistantBackend.dto.game.GameRequestDTO;
import ru.project.gameAssistantBackend.exception.customEx.notFound.CategoryNotFoundException;
import ru.project.gameAssistantBackend.exception.customEx.notFound.GameNotFoundException;
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
    public List<Game> getAllGames(){
        return gameRepository.findAll();
    }

    @Override
    public Game getGameById(Long id) throws GameNotFoundException {
        return gameRepository.findById(id)
                .orElseThrow(() -> new GameNotFoundException("Игра с таким id не найдена"));
    }

    @Transactional
    @Override
    public Game create(GameRequestDTO gameRequestDTO) throws CategoryNotFoundException {
        Game game = new Game();
        game.setTitle(gameRequestDTO.title());
        game.setDescription(gameRequestDTO.description());

        List<String> categoryNames = gameRequestDTO.categories();
        Set<Category> categories = categoryService.getCategories(categoryNames);
        game.setCategories(categories);

        MultipartFile imageFile = gameRequestDTO.imageFile();
        String imageFileTitle = fileServiceImpl.save(imageFile);
        game.setImageFileTitle(imageFileTitle);

        MultipartFile rulesFile = gameRequestDTO.rulesFile();
        String rulesFileTitle = fileServiceImpl.save(rulesFile);
        game.setRulesFileTitle(rulesFileTitle);
        converter.convertPdfToMdAsync(rulesFileTitle);
        return gameRepository.save(game);
    }

    @Transactional
    @Override
    public Game update(Long id, GameRequestDTO gameRequestDTO)
            throws GameNotFoundException, CategoryNotFoundException {
        Game game = getGameById(id);
        if(gameRequestDTO.title() != null) {
            game.setTitle(gameRequestDTO.title());
        }

        if(gameRequestDTO.description() != null) {
            game.setDescription(gameRequestDTO.description());
        }

        List<String> categoryNames = gameRequestDTO.categories();
        if(categoryNames != null && !categoryNames.isEmpty()){
            Set<Category> categories = categoryService.getCategories(categoryNames);
            game.setCategories(categories);
        }

        MultipartFile newImageFile = gameRequestDTO.imageFile();
        if(newImageFile != null && !newImageFile.isEmpty()){
            String oldImageFileTitle = game.getImageFileTitle();
            fileServiceImpl.delete(oldImageFileTitle);
            String newImageFileTitle = fileServiceImpl.save(newImageFile);
            game.setImageFileTitle(newImageFileTitle);
        }

        MultipartFile newRulesFile = gameRequestDTO.rulesFile();
        if(newRulesFile != null && !newRulesFile.isEmpty()){
            String oldRulesFileTitle = game.getRulesFileTitle();
            fileServiceImpl.delete(oldRulesFileTitle);
            String newRulesFileTitle = fileServiceImpl.save(newRulesFile);
            converter.convertPdfToMdAsync(newRulesFileTitle);
            fileServiceImpl.delete(oldRulesFileTitle.replace(".pdf", ".md"));
            game.setRulesFileTitle(newRulesFileTitle);
        }

        return gameRepository.save(game);
    }

    @Transactional
    @Override
    public void delete(Long id) throws GameNotFoundException {
        Game game = getGameById(id);
        String imageFileTitle = game.getImageFileTitle();
        String rulesFileTitle = game.getRulesFileTitle();
        fileServiceImpl.delete(imageFileTitle);
        fileServiceImpl.delete(rulesFileTitle);
        gameRepository.delete(game);
    }

    public long getCountByCategory(Category category){
        return gameRepository.countByCategories_Name(category.getName());
    }
}
