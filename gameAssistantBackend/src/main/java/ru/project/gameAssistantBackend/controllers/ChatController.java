package ru.project.gameAssistantBackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import ru.project.gameAssistantBackend.dto.chat.ChatDTO;
import ru.project.gameAssistantBackend.dto.chat.PromptDTO;
import ru.project.gameAssistantBackend.dto.chat.StartChatDTO;
import ru.project.gameAssistantBackend.models.Chat;
import ru.project.gameAssistantBackend.service.ChatService;

import java.io.IOException;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    @Autowired
    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/{id}")
    public ChatDTO getChat(@PathVariable("id") Long id){
        Chat chat = chatService.getChatById(id);
        return chatService.mapToDTO(chat);
    }

    @PostMapping("/start")
    public ChatDTO startChat(@RequestBody StartChatDTO startChatDTO) throws IOException {
        Chat chat = chatService.startChat(startChatDTO);
        return chatService.mapToDTO(chat);
    }

    @PutMapping("/{id}")
    public ChatDTO continueChat(@PathVariable("id") Long id, @RequestBody PromptDTO promptDTO) {
        Chat chat = chatService.continueChat(id, promptDTO);
        return chatService.mapToDTO(chat);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable("id") Long id) {
        return chatService.delete(id);
    }
}
