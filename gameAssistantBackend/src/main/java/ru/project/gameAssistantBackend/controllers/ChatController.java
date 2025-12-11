package ru.project.gameAssistantBackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import ru.project.gameAssistantBackend.dto.chat.*;
import ru.project.gameAssistantBackend.exception.customEx.notFound.ChatNotFoundException;
import ru.project.gameAssistantBackend.exception.customEx.notFound.GameNotFoundException;
import ru.project.gameAssistantBackend.exception.customEx.notFound.SystemPropertiesNotFoundException;
import ru.project.gameAssistantBackend.exception.customEx.notFound.UserNotFoundException;
import ru.project.gameAssistantBackend.models.Model;
import ru.project.gameAssistantBackend.mapper.ChatMapper;
import ru.project.gameAssistantBackend.models.Chat;
import ru.project.gameAssistantBackend.service.AssistantService;
import ru.project.gameAssistantBackend.service.impl.AuthServiceImpl;
import ru.project.gameAssistantBackend.service.impl.SystemPropertiesServiceImpl;
import ru.project.gameAssistantBackend.service.impl.assistant.ChatModelFactory;
import ru.project.gameAssistantBackend.service.impl.assistant.ChatServiceImpl;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatServiceImpl chatServiceImpl;

    private final ChatMapper chatMapper;

    private final ChatModelFactory chatModelFactory;

    private final AuthServiceImpl authServiceImpl;

    private final SystemPropertiesServiceImpl systemPropertiesServiceImpl;

    @Autowired
    public ChatController(
            ChatServiceImpl chatServiceImpl,
            ChatMapper chatMapper,
            ChatModelFactory chatModelFactory,
            AuthServiceImpl authServiceImpl,
            SystemPropertiesServiceImpl systemPropertiesServiceImpl
    ) {
        this.chatServiceImpl = chatServiceImpl;
        this.chatMapper = chatMapper;
        this.chatModelFactory = chatModelFactory;
        this.authServiceImpl = authServiceImpl;
        this.systemPropertiesServiceImpl = systemPropertiesServiceImpl;
    }

    @GetMapping("/{chatId}")
    public ChatDTO getChat(@PathVariable("chatId") Long chatId)
            throws ChatNotFoundException {
        Chat chat = chatServiceImpl.getChatById(chatId);
        return chatMapper.mapToChatDTO(chat);
    }

    @PostMapping("/start")
    public ChatDTO startChat(@RequestBody StartChatDTO startChatDTO)
            throws GameNotFoundException, SystemPropertiesNotFoundException, UserNotFoundException {
        Chat chat = chatServiceImpl.startChat(startChatDTO);
        return chatMapper.mapToChatDTO(chat);
    }

    @PutMapping("/{chatId}")
    public ChatDTO continueChat(
            @PathVariable("chatId") Long chatId,
            @RequestBody SystemPropertiesDTO systemPropertiesDTO)
            throws ChatNotFoundException {
        Chat chat = chatServiceImpl.continueChat(chatId, systemPropertiesDTO);
        return chatMapper.mapToChatDTO(chat);
    }

    @PostMapping(value = "/{chatId}/answer", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> getStreamedAnswer(@PathVariable Long chatId)
            throws SystemPropertiesNotFoundException, ChatNotFoundException, UserNotFoundException {
        Model userModel = authServiceImpl.getAuthenticatedUser().getModel();
        Model model = systemPropertiesServiceImpl.getSystemProperties().getModel();

        AssistantService service = null;
        if(userModel != null){
            service = chatModelFactory.getModel(String.valueOf(userModel));
        } else {
            service = chatModelFactory.getModel(String.valueOf(model));
        }

        Chat chat = chatServiceImpl.getChatById(chatId);
        return service.getStreamedAnswer(
                chat.getMessages(),
                answer -> {
                    try {
                        chatServiceImpl.saveAssistantStreamingAnswer(chatId, answer);
                    } catch (ChatNotFoundException e) {
                        throw new RuntimeException(e);
                    }
                }
        );
    }

    @DeleteMapping("/{chatId}")
    public String delete(@PathVariable("chatId") Long chatId)
            throws ChatNotFoundException {
        return chatServiceImpl.delete(chatId);
    }

    @GetMapping("/md/{chatId}")
    public String getMarkdownParsed(@PathVariable("chatId") Long chatId)
            throws GameNotFoundException, SystemPropertiesNotFoundException {
        return chatServiceImpl.getSystemMessageTextMd(chatId);
    }

    @GetMapping("/by-game/{gameId}")
    public List<ChatPreviewDTO> getChatPreviews(@PathVariable("gameId") Long gameId)
            throws UserNotFoundException {
        List<Chat> chats = chatServiceImpl.getChatsByGameAndUser(gameId);
        return chatMapper.mapToPreviewDTOs(chats);
    }

    @GetMapping("/by-user")
    public List<ChatPreviewDTO> getChatPreviews()
            throws UserNotFoundException {
        List<Chat> chats = chatServiceImpl.getChatsByAuthUser();
        return chatMapper.mapToPreviewDTOs(chats);
    }

    @GetMapping("/models")
    public List<Model> getModels(){
        return List.of(Model.values());
    }
}
