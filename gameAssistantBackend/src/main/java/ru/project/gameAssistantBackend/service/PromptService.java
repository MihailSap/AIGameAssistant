package ru.project.gameAssistantBackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.project.gameAssistantBackend.dto.chat.PromptDTO;
import ru.project.gameAssistantBackend.models.Prompt;
import ru.project.gameAssistantBackend.repository.PromptRepository;

@Service
public class PromptService {

    private final PromptRepository promptRepository;

    @Autowired
    public PromptService(PromptRepository promptRepository) {
        this.promptRepository = promptRepository;
    }

    @Transactional
    public Prompt create(PromptDTO promptDTO){
        if(isPromptExists()){
            throw new RuntimeException("Промпт уже создан");
        }

        Prompt prompt = new Prompt();
        prompt.setText(promptDTO.text());
        return promptRepository.save(prompt);
    }

    public Prompt get(){
        return promptRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Промпт не найден"));
    }

    public String getPromptText(){
        return get().getText();
    }

    @Transactional
    public Prompt update(PromptDTO promptDTO){
        if(!isPromptExists()){
            throw new RuntimeException("Промпт ещё не создан");
        }

        Prompt prompt = get();
        prompt.setText(promptDTO.text());
        return promptRepository.save(prompt);
    }

    @Transactional
    public void delete(){
        if(!isPromptExists()){
            throw new RuntimeException("Промпт ещё не создан");
        }

        Prompt prompt = get();
        promptRepository.delete(prompt);
    }

    public PromptDTO mapToDTO(Prompt prompt){
        return new PromptDTO(prompt.getText());
    }

    public boolean isPromptExists(){
        return !promptRepository.findAll().isEmpty();
    }
}
