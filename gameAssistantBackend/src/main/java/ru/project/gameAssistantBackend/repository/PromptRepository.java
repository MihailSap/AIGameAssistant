package ru.project.gameAssistantBackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.project.gameAssistantBackend.models.Prompt;

import java.util.Optional;

@Repository
public interface PromptRepository extends JpaRepository<Prompt, Long> {
}
