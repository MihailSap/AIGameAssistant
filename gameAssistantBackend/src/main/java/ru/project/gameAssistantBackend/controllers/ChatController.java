package ru.project.gameAssistantBackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import ru.project.gameAssistantBackend.dto.chat.*;
import ru.project.gameAssistantBackend.mapper.ChatMapper;
import ru.project.gameAssistantBackend.models.Chat;
import ru.project.gameAssistantBackend.service.AssistantService;
import ru.project.gameAssistantBackend.service.impl.assistant.ChatModelFactory;
import ru.project.gameAssistantBackend.service.impl.assistant.ChatServiceImpl;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatServiceImpl chatServiceImpl;

    private final ChatMapper chatMapper;

    private final ChatModelFactory chatModelFactory;

    @Autowired
    public ChatController(
            ChatServiceImpl chatServiceImpl,
            ChatMapper chatMapper,
            ChatModelFactory chatModelFactory) {
        this.chatServiceImpl = chatServiceImpl;
        this.chatMapper = chatMapper;
        this.chatModelFactory = chatModelFactory;
    }

    @GetMapping("/{id}")
    public ChatDTO getChat(@PathVariable("id") Long id){
        Chat chat = chatServiceImpl.getChatById(id);
        return chatMapper.mapToChatDTO(chat);
    }

    @PostMapping("/start")
    public ChatDTO startChat(@RequestBody StartChatDTO startChatDTO) throws IOException {
        Chat chat = chatServiceImpl.startChat(startChatDTO);
        return chatMapper.mapToChatDTO(chat);
    }

    @PutMapping("/{id}")
    public ChatDTO continueChat(@PathVariable("id") Long id, @RequestBody PromptDTO promptDTO) {
        Chat chat = chatServiceImpl.continueChat(id, promptDTO);
        return chatMapper.mapToChatDTO(chat);
    }

    @PostMapping(value = "/{chatId}/answer", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> getStreamedAnswer(
            @PathVariable Long chatId, @RequestParam(defaultValue = "yandex") String model) {
        Chat chat = chatServiceImpl.getChatById(chatId);
        AssistantService service = chatModelFactory.getModel(model);
        return service.getStreamedAnswer(
                chat.getMessages(),
                answer -> chatServiceImpl.saveAssistantStreamingAnswer(chatId, answer)
        );
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable("id") Long id) {
        return chatServiceImpl.delete(id);
    }

    @GetMapping("/md/{id}")
    public String getMarkdownParsed(@PathVariable("id") Long id) {
        return chatServiceImpl.getSystemMessageTextMd(id);
    }

    @GetMapping("/by-game/{gameId}")
    public List<ChatPreviewDTO> getChatPreviews(@PathVariable("gameId") Long gameId) {
        List<Chat> chats = chatServiceImpl.getChatsByGameAndUser(gameId);
        return chatMapper.mapToPreviewDTOs(chats);
    }

    @GetMapping("/by-user")
    public List<ChatPreviewDTO> getChatPreviews() {
        List<Chat> chats = chatServiceImpl.getChatsByAuthUser();
        return chatMapper.mapToPreviewDTOs(chats);
    }
}
