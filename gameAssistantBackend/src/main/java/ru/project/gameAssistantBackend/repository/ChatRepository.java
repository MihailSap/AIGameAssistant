package ru.project.gameAssistantBackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.project.gameAssistantBackend.models.Chat;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {
}
