package ru.project.gameAssistantBackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import ru.project.gameAssistantBackend.dto.ResponseDTO;
import ru.project.gameAssistantBackend.dto.game.GamePreviewDTO;
import ru.project.gameAssistantBackend.models.Game;
import ru.project.gameAssistantBackend.models.User;
import ru.project.gameAssistantBackend.service.AuthService;
import ru.project.gameAssistantBackend.service.FavouriteService;
import ru.project.gameAssistantBackend.service.GameService;
import ru.project.gameAssistantBackend.service.UserService;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/favourites")
public class FavouriteController {

    private final FavouriteService favouriteService;
    private final AuthService authService;
    private final UserService userService;
    private final GameService gameService;

    @Autowired
    public FavouriteController(FavouriteService favouriteService, AuthService authService, UserService userService, GameService gameService) {
        this.favouriteService = favouriteService;
        this.authService = authService;
        this.userService = userService;
        this.gameService = gameService;
    }

    @PostMapping("/{gameId}/add")
    public ResponseDTO addGameToFavourites(@PathVariable("gameId") Long gameId){
        String userEmail = authService.getAuthenticatedUserEmail();
        Long userId = userService.getByEmail(userEmail).get().getId();
        favouriteService.addGameToUserFavourites(userId, gameId);
        String message = String.format("Игра с id=%d добавлена в избранные текущего пользователя", gameId);
        return new ResponseDTO(message);
    }

    @DeleteMapping("/{gameId}/remove")
    public ResponseDTO removeGameFromFavourites(@PathVariable("gameId") Long gameId){
        String userEmail = authService.getAuthenticatedUserEmail();
        Long userId = userService.getByEmail(userEmail).get().getId();
        favouriteService.removeGameFromUserFavourites(userId, gameId);
        String message = String.format("Игра с id=%d удалена из избранных текущего пользователя", gameId);
        return new ResponseDTO(message);
    }

    @GetMapping
    public List<GamePreviewDTO> getFavourites(){
        String userEmail = authService.getAuthenticatedUserEmail();
        User user = userService.getByEmail(userEmail).get();
        Set<Game> games = user.getGames();
        return gameService.mapToPreviews(games);
    }
}
