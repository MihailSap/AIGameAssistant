package ru.project.gameAssistantBackend.service.impl;

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
import ru.project.gameAssistantBackend.service.ChatServiceI;
import ru.project.gameAssistantBackend.utils.PdfToMarkdown;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class ChatServiceImpl implements ChatServiceI {

    private final GameServiceImpl gameServiceImpl;
    private final PromptServiceImpl promptServiceImpl;
    private final UserServiceImpl userServiceImpl;
    private final ChatRepository chatRepository;
    private final AssistantServiceImpl assistantServiceImpl;
    private final PdfToMarkdown pdfToMarkdown;

    @Autowired
    public ChatServiceImpl(GameServiceImpl gameServiceImpl,
                           PromptServiceImpl promptServiceImpl,
                           UserServiceImpl userServiceImpl,
                           ChatRepository chatRepository,
                           AssistantServiceImpl assistantServiceImpl,
                           PdfToMarkdown pdfToMarkdown) {
        this.gameServiceImpl = gameServiceImpl;
        this.promptServiceImpl = promptServiceImpl;
        this.userServiceImpl = userServiceImpl;
        this.chatRepository = chatRepository;
        this.assistantServiceImpl = assistantServiceImpl;
        this.pdfToMarkdown = pdfToMarkdown;
    }

    @Transactional
    @Override
    public Chat startChat(StartChatDTO startChatDTO) throws IOException {
        Chat chat = create(startChatDTO.userId());
        String systemMessageText = getSystemMessageTextMd(startChatDTO.gameId());
        chat.addMessage(systemMessageText, ChatRole.system);
        chat.addMessage(startChatDTO.request(), ChatRole.user);
        String assistantAnswerText = assistantServiceImpl.getAssistantAnswer(chat.getMessages());
        chat.addMessage(assistantAnswerText, ChatRole.assistant);
        return chatRepository.save(chat);
    }

    @Transactional
    @Override
    public Chat continueChat(Long id, PromptDTO promptDTO){
        Chat chat = getChatById(id);
        chat.addMessage(promptDTO.text(), ChatRole.user);
        String assistantAnswerText = assistantServiceImpl.getAssistantAnswer(chat.getMessages());
        chat.addMessage(assistantAnswerText, ChatRole.assistant);
        return chatRepository.save(chat);
    }

    @Transactional
    @Override
    public Chat create(Long userId){
        Chat chat = new Chat();
        User user = userServiceImpl.getById(userId);
        chat.setUzer(user);
        return chatRepository.save(chat);
    }

    @Transactional
    @Override
    public String delete(Long id){
        Chat chat = getChatById(id);
        chatRepository.delete(chat);
        return "Данный Chat удален вместе с сообщениями";
    }

    @Override
    public Chat getChatById(Long chatId){
        return chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat с таким id не найден"));
    }

    @Override
    public ChatDTO mapToDTO(Chat chat){
        List<Message> messages = chat.getMessages();
        List<MessageDTO> messageDTOs = new ArrayList<>();
        for (Message message : messages) {
            messageDTOs.add(new MessageDTO(message.getRole(), message.getText(), message.getTimestamp()));
        }
        return new ChatDTO(chat.getId(), messageDTOs);
    }

    public String getSystemMessageText(Long gameId) throws IOException {
        String promptText = promptServiceImpl.getPromptText();
        String rulesText = gameServiceImpl.getRulesText(gameId);
        rulesText = rulesText.replace("\r", "").replace("\n", "");
        return String.format("%s %s", promptText, rulesText);
    }

    @Override
    public String getSystemMessageTextMd(Long gameId) throws IOException {
        String promptText = promptServiceImpl.getPromptText();
        String rulesText = gameServiceImpl.getRulesText(gameId);
        String rulesMdText = pdfToMarkdown.convertTextToMarkdown(rulesText);
        return String.format("%s %s", promptText, rulesMdText);
    }
}