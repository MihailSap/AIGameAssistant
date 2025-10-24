package ru.project.gameAssistantBackend.service;

public interface FavouritesServiceI {

    void addGameToUserFavourites(Long userId, Long gameId);

    void removeGameFromUserFavourites(Long userId, Long gameId);
}
