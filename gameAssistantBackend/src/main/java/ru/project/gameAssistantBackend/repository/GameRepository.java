package ru.project.gameAssistantBackend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;
import ru.project.gameAssistantBackend.models.Game;

public interface GameRepository extends JpaRepository<Game, Long> {

    long countByCategories_Name(String categoryName);

    @Override
    @NonNull
    Page<Game> findAll(@NonNull Pageable pageable);
}
