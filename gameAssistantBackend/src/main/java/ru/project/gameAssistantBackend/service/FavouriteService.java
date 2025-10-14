package ru.project.gameAssistantBackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.project.gameAssistantBackend.models.Game;
import ru.project.gameAssistantBackend.models.User;
import ru.project.gameAssistantBackend.repository.UserRepository;

import java.util.Set;

@Service
public class FavouriteService {

    private final UserService userService;
    private final GameService gameService;
    private final UserRepository userRepository;

    @Autowired
    public FavouriteService(UserService userService, GameService gameService, UserRepository userRepository) {
        this.userService = userService;
        this.gameService = gameService;
        this.userRepository = userRepository;
    }

    @Transactional
    public void addGameToUserFavourites(Long userId, Long gameId){
        User user = userService.getById(userId);
        Game game = gameService.getById(gameId);
        Set<Game> userFavouriteGames = user.getGames();
        if(userFavouriteGames.contains(game)){
            throw new RuntimeException("Игра с данным id уже добавлена в избранное пользователя!");
        }
        user.addGame(game);
        userRepository.save(user);
    }

    @Transactional
    public void removeGameFromUserFavourites(Long userId, Long gameId){
        User user = userService.getById(userId);
        Game game = gameService.getById(gameId);
        Set<Game> userFavouriteGames = user.getGames();
        if(!userFavouriteGames.contains(game)){
            throw new RuntimeException("Игры с данным id нет в избранном пользователя!");
        }
        user.removeGame(game);
        userRepository.save(user);
    }
}
