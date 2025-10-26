package ru.project.gameAssistantBackend.service;

import ru.project.gameAssistantBackend.dto.chat.ChatDTO;
import ru.project.gameAssistantBackend.dto.chat.ChatPreviewDTO;
import ru.project.gameAssistantBackend.dto.chat.PromptDTO;
import ru.project.gameAssistantBackend.dto.chat.StartChatDTO;
import ru.project.gameAssistantBackend.models.Chat;
import ru.project.gameAssistantBackend.models.Message;

import java.io.IOException;
import java.util.List;

public interface ChatServiceI {

    Chat startChat(StartChatDTO startChatDTO) throws IOException;

    Chat continueChat(Long id, PromptDTO promptDTO);

    Chat create(Long gameId);

    String delete(Long id);

    Chat getChatById(Long chatId);

    ChatDTO mapToDTO(Chat chat);

    String getSystemMessageTextMd(Long gameId) throws IOException;

    String getPromptForTitle(List<Message> messages);

    List<Chat> getChatsByGameAndUser(Long gameId);

    List<ChatPreviewDTO> mapToPreviews(List<Chat> chats);

    ChatPreviewDTO mapToChatPreviewDTO(Chat chat);
}
