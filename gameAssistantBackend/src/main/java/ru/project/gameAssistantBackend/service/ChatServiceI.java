package ru.project.gameAssistantBackend.service;

import ru.project.gameAssistantBackend.dto.chat.ChatDTO;
import ru.project.gameAssistantBackend.dto.chat.PromptDTO;
import ru.project.gameAssistantBackend.dto.chat.StartChatDTO;
import ru.project.gameAssistantBackend.models.Chat;

import java.io.IOException;

public interface ChatServiceI {

    Chat startChat(StartChatDTO startChatDTO) throws IOException;

    Chat continueChat(Long id, PromptDTO promptDTO);

    Chat create(Long userId);

    String delete(Long id);

    Chat getChatById(Long chatId);

    ChatDTO mapToDTO(Chat chat);

    String getSystemMessageTextMd(Long gameId) throws IOException;
}
