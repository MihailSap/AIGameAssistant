package ru.project.gameAssistantBackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.project.gameAssistantBackend.dto.chat.ChatDTO;
import ru.project.gameAssistantBackend.dto.chat.MessageDTO;
import ru.project.gameAssistantBackend.dto.chat.PromptDTO;
import ru.project.gameAssistantBackend.dto.chat.StartChatDTO;
import ru.project.gameAssistantBackend.enums.ChatRole;
import ru.project.gameAssistantBackend.models.Chat;
import ru.project.gameAssistantBackend.models.Message;
import ru.project.gameAssistantBackend.models.User;
import ru.project.gameAssistantBackend.repository.ChatRepository;
import ru.project.gameAssistantBackend.utils.PdfToMarkdown;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class ChatService {

    private final GameService gameService;
    private final PromptService promptService;
    private final UserService userService;
    private final ChatRepository chatRepository;
    private final YandexGPTService yandexGPTService;
    private final PdfToMarkdown pdfToMarkdown;

    @Autowired
    public ChatService(GameService gameService,
                       PromptService promptService,
                       UserService userService,
                       ChatRepository chatRepository,
                       YandexGPTService yandexGPTService,
                       PdfToMarkdown pdfToMarkdown) {
        this.gameService = gameService;
        this.promptService = promptService;
        this.userService = userService;
        this.chatRepository = chatRepository;
        this.yandexGPTService = yandexGPTService;
        this.pdfToMarkdown = pdfToMarkdown;
    }

    @Transactional
    public Chat startChat(StartChatDTO startChatDTO) throws IOException {
        Chat chat = create(startChatDTO.userId());
//        String systemMessageText = getSystemMessageText(startChatDTO.gameId());
        String systemMessageText = getSystemMessageTextMd(startChatDTO.gameId());
        chat.addMessage(systemMessageText, ChatRole.system);
        chat.addMessage(startChatDTO.request(), ChatRole.user);
//        String assistantAnswerText = yandexGPTService.getAnswerByMessages(chat.getMessages());
        String assistantAnswerText = yandexGPTService.getAssistantAnswer(chat.getMessages());
        chat.addMessage(assistantAnswerText, ChatRole.assistant);
        return chatRepository.save(chat);
    }

    @Transactional
    public Chat continueChat(Long id, PromptDTO promptDTO){
        Chat chat = getChatById(id);
        chat.addMessage(promptDTO.text(), ChatRole.user);
//        String assistantAnswerText = yandexGPTService.getAnswerByMessages(chat.getMessages());
        String assistantAnswerText = yandexGPTService.getAssistantAnswer(chat.getMessages());
        chat.addMessage(assistantAnswerText, ChatRole.assistant);
        return chatRepository.save(chat);
    }

    @Transactional
    public Chat create(Long userId){
        Chat chat = new Chat();
        User user = userService.getById(userId);
        chat.setUzer(user);
        return chatRepository.save(chat);
    }

    @Transactional
    public String delete(Long id){
        Chat chat = getChatById(id);
        chatRepository.delete(chat);
        return "Данный Chat удален вместе с сообщениями";
    }

    public Chat getChatById(Long chatId){
        return chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat с таким id не найден"));
    }

    public ChatDTO mapToDTO(Chat chat){
        List<Message> messages = chat.getMessages();
        List<MessageDTO> messageDTOs = new ArrayList<>();
        for (Message message : messages) {
            messageDTOs.add(new MessageDTO(message.getRole(), message.getText(), message.getTimestamp()));
        }
        return new ChatDTO(chat.getId(), messageDTOs);
    }

    public String getSystemMessageText(Long gameId) throws IOException {
        String promptText = promptService.getPromptText();
        String rulesText = gameService.getRulesText(gameId);
        rulesText = rulesText.replace("\r", "").replace("\n", "");
        return String.format("%s %s", promptText, rulesText);
    }

    public String getSystemMessageTextMd(Long gameId) throws IOException {
        String promptText = promptService.getPromptText();
        String rulesText = gameService.getRulesText(gameId);
        String rulesMdText = pdfToMarkdown.convertTextToMarkdown(rulesText);
        return String.format("%s %s", promptText, rulesMdText);
    }
}