package ru.project.gameAssistantBackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.project.gameAssistantBackend.models.Game;

public interface GameRepository extends JpaRepository<Game, Long> {

    long countByCategories_Name(String categoryName);
}
