package ru.project.gameAssistantBackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import ru.project.gameAssistantBackend.dto.ResponseDTO;
import ru.project.gameAssistantBackend.dto.game.GamePreviewDTO;
import ru.project.gameAssistantBackend.models.Game;
import ru.project.gameAssistantBackend.models.User;
import ru.project.gameAssistantBackend.service.impl.AuthServiceImpl;
import ru.project.gameAssistantBackend.service.impl.FavouritesServiceImpl;
import ru.project.gameAssistantBackend.mapper.GameMapper;
import ru.project.gameAssistantBackend.service.impl.UserServiceImpl;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/favourites")
public class FavouritesController {

    private final FavouritesServiceImpl favouritesServiceImpl;
    private final AuthServiceImpl authServiceImpl;
    private final UserServiceImpl userServiceImpl;
    private final GameMapper gameMapper;

    @Autowired
    public FavouritesController(FavouritesServiceImpl favouritesServiceImpl, AuthServiceImpl authServiceImpl, UserServiceImpl userServiceImpl, GameMapper gameMapper) {
        this.favouritesServiceImpl = favouritesServiceImpl;
        this.authServiceImpl = authServiceImpl;
        this.userServiceImpl = userServiceImpl;
        this.gameMapper = gameMapper;
    }

    @PostMapping("/{gameId}")
    public ResponseDTO addGameToFavourites(@PathVariable("gameId") Long gameId){
        String userEmail = authServiceImpl.getAuthenticatedUserEmail();
        Long userId = userServiceImpl.getByEmail(userEmail).get().getId();
        favouritesServiceImpl.addGameToUserFavourites(userId, gameId);
        String message = String.format("Игра с id=%d добавлена в избранные текущего пользователя", gameId);
        return new ResponseDTO(message);
    }

    @DeleteMapping("/{gameId}")
    public ResponseDTO removeGameFromFavourites(@PathVariable("gameId") Long gameId){
        String userEmail = authServiceImpl.getAuthenticatedUserEmail();
        Long userId = userServiceImpl.getByEmail(userEmail).get().getId();
        favouritesServiceImpl.removeGameFromUserFavourites(userId, gameId);
        return new ResponseDTO(String.format(
                "Игра с id=%d удалена из избранных текущего пользователя", gameId));
    }

    @GetMapping
    public List<GamePreviewDTO> getFavourites(){
        String userEmail = authServiceImpl.getAuthenticatedUserEmail();
        User user = userServiceImpl.getByEmail(userEmail).get();
        Set<Game> games = user.getGames();
        return gameMapper.mapToGamePreviewDTOs(games);
    }
}
