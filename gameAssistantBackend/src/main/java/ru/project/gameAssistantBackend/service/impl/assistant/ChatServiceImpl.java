package ru.project.gameAssistantBackend.service.impl.assistant;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.project.gameAssistantBackend.dto.chat.*;
import ru.project.gameAssistantBackend.enums.ChatRole;
import ru.project.gameAssistantBackend.models.Chat;
import ru.project.gameAssistantBackend.models.Game;
import ru.project.gameAssistantBackend.models.Message;
import ru.project.gameAssistantBackend.models.User;
import ru.project.gameAssistantBackend.repository.ChatRepository;
import ru.project.gameAssistantBackend.service.ChatServiceI;
import ru.project.gameAssistantBackend.service.impl.AuthServiceImpl;
import ru.project.gameAssistantBackend.service.impl.FileServiceImpl;
import ru.project.gameAssistantBackend.service.impl.GameServiceImpl;
import ru.project.gameAssistantBackend.service.impl.PromptServiceImpl;

import java.io.IOException;
import java.time.Instant;
import java.util.List;

@Service
public class ChatServiceImpl implements ChatServiceI {

    private final GameServiceImpl gameServiceImpl;
    private final PromptServiceImpl promptServiceImpl;
    private final AuthServiceImpl authServiceImpl;
    private final ChatRepository chatRepository;
    private final FileServiceImpl fileServiceImpl;
    private final AssistantServiceImpl assistantServiceImpl;

    @Autowired
    public ChatServiceImpl(GameServiceImpl gameServiceImpl,
                           PromptServiceImpl promptServiceImpl,
                           ChatRepository chatRepository,
                           AuthServiceImpl authServiceImpl,
                           FileServiceImpl fileServiceImpl, AssistantServiceImpl assistantServiceImpl) {
        this.gameServiceImpl = gameServiceImpl;
        this.promptServiceImpl = promptServiceImpl;
        this.chatRepository = chatRepository;
        this.authServiceImpl = authServiceImpl;
        this.fileServiceImpl = fileServiceImpl;
        this.assistantServiceImpl = assistantServiceImpl;
    }

    @Transactional
    @Override
    public Chat startChat(StartChatDTO startChatDTO) throws IOException {
        Chat chat = create(startChatDTO.gameId());
        String systemMessageText = getSystemMessageTextMd(startChatDTO.gameId());
        chat.addMessage(systemMessageText, ChatRole.system);
        chat.addMessage(startChatDTO.request(), ChatRole.user);
        chat.setLastUseTime(Instant.now());
        String promptForTitle = getPromptForTitle(chat.getMessages());
        String title = assistantServiceImpl.getAnswer(promptForTitle);
        chat.setTitle(title);
        return chatRepository.save(chat);
    }

    @Transactional
    @Override
    public Chat continueChat(Long id, PromptDTO promptDTO){
        Chat chat = getChatById(id);
        chat.addMessage(promptDTO.text(), ChatRole.user);
        return chatRepository.save(chat);
    }

    @Transactional
    @Override
    public Chat create(Long gameId){
        Chat chat = new Chat();
        User user = authServiceImpl.getAuthenticatedUser();
        Game game = gameServiceImpl.getById(gameId);
        chat.setUzer(user);
        chat.setGame(game);
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
    public String getSystemMessageTextMd(Long gameId) {
        String promptText = promptServiceImpl.getPromptText();
        String rulesFileTitle = gameServiceImpl.getById(gameId).getRulesFileTitle();
        String rulesMdText = fileServiceImpl.extractTextFromMarkdown(rulesFileTitle);
        return String.format("%s %s", promptText, rulesMdText);
    }

    @Override
    public String getPromptForTitle(List<Message> messages){
        String promptStr = """
                Сформулируй название для чата. Название не должно состоять более чем из 5 слов.
                Название чата должно затрагивать саму игру и мой вопрос.
                Верни только название чата и ничего более. Сообщения чата: 
                """;
        StringBuilder prompt = new StringBuilder();
        prompt.append(promptStr);
        for (Message message : messages) {
            prompt.append(message.getRole())
                    .append(": ")
                    .append(message.getText())
                    .append("; ");
        }
        return prompt.toString();
    }

    @Override
    public List<Chat> getChatsByGameAndUser(Long gameId){
        User user = authServiceImpl.getAuthenticatedUser();
        return chatRepository.findByUzerIdAndGameId(user.getId(), gameId);
    }

    public List<Chat> getChatsByAuthUser(){
        User user = authServiceImpl.getAuthenticatedUser();
        return chatRepository.findByUzerId(user.getId());
    }

    @Transactional
    public void saveAssistantStreamingAnswer(Long chatId, String text) {
        Chat chat = getChatById(chatId);
        chat.addMessage(text, ChatRole.assistant);
        chat.setLastUseTime(Instant.now());
        chatRepository.save(chat);
    }
}