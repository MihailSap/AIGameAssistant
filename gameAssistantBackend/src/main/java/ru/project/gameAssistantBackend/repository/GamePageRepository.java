package ru.project.gameAssistantBackend.repository;

import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import ru.project.gameAssistantBackend.models.Game;

@Repository
public interface GamePageRepository extends PagingAndSortingRepository<Game, Long> {
}
