package ru.project.gameAssistantBackend.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.project.gameAssistantBackend.dto.chat.PromptDTO;
import ru.project.gameAssistantBackend.models.Prompt;
import ru.project.gameAssistantBackend.repository.PromptRepository;
import ru.project.gameAssistantBackend.service.PromptServiceI;

@Service
public class PromptServiceImpl implements PromptServiceI {

    private final PromptRepository promptRepository;

    @Autowired
    public PromptServiceImpl(PromptRepository promptRepository) {
        this.promptRepository = promptRepository;
    }

    @Override
    public Prompt get(){
        return promptRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Промпт не найден"));
    }

    @Override
    public String getPromptText(){
        return get().getText();
    }

    @Transactional
    @Override
    public Prompt update(PromptDTO promptDTO){
        if(!isPromptExists()){
            throw new RuntimeException("Промпт ещё не создан");
        }

        Prompt prompt = get();
        prompt.setText(promptDTO.text());
        return promptRepository.save(prompt);
    }

    @Override
    public PromptDTO mapToDTO(Prompt prompt){
        return new PromptDTO(prompt.getText());
    }

    @Override
    public boolean isPromptExists(){
        return !promptRepository.findAll().isEmpty();
    }
}
