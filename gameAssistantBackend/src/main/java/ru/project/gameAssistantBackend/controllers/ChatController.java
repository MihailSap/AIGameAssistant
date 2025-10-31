package ru.project.gameAssistantBackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import ru.project.gameAssistantBackend.dto.chat.*;
import ru.project.gameAssistantBackend.models.Chat;
import ru.project.gameAssistantBackend.service.impl.ChatServiceImpl;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatServiceImpl chatServiceImpl;

    @Autowired
    public ChatController(ChatServiceImpl chatServiceImpl) {
        this.chatServiceImpl = chatServiceImpl;
    }

    @GetMapping("/{id}")
    public ChatDTO getChat(@PathVariable("id") Long id){
        Chat chat = chatServiceImpl.getChatById(id);
        return chatServiceImpl.mapToDTO(chat);
    }

    @PostMapping("/start")
    public ChatDTO startChat(@RequestBody StartChatDTO startChatDTO) throws IOException {
        Chat chat = chatServiceImpl.startChat(startChatDTO);
        return chatServiceImpl.mapToDTO(chat);
    }

    @PutMapping("/{id}")
    public ChatDTO continueChat(@PathVariable("id") Long id, @RequestBody PromptDTO promptDTO) {
        Chat chat = chatServiceImpl.continueChat(id, promptDTO);
        return chatServiceImpl.mapToDTO(chat);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable("id") Long id) {
        return chatServiceImpl.delete(id);
    }

    @GetMapping("/md/{id}")
    public String getMarkdownParsed(@PathVariable("id") Long id) throws IOException {
        return chatServiceImpl.getSystemMessageTextMd(id);
    }

    @GetMapping("/by-game/{gameId}")
    public List<ChatPreviewDTO> getChatPreviews(@PathVariable("gameId") Long gameId) {
        List<Chat> chats = chatServiceImpl.getChatsByGameAndUser(gameId);
        return chatServiceImpl.mapToPreviews(chats);
    }

    @GetMapping("/by-user")
    public List<ChatPreviewDTO> getChatPreviews() {
        List<Chat> chats = chatServiceImpl.getChatsByAuthUser();
        return chatServiceImpl.mapToPreviews(chats);
    }
}
