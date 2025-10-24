package ru.project.gameAssistantBackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.project.gameAssistantBackend.dto.chat.PromptDTO;
import ru.project.gameAssistantBackend.models.Prompt;
import ru.project.gameAssistantBackend.service.impl.PromptServiceImpl;

@RestController
@RequestMapping("/api/prompt")
public class PromptController {

    private final PromptServiceImpl promptServiceImpl;

    @Autowired
    public PromptController(PromptServiceImpl promptServiceImpl) {
        this.promptServiceImpl = promptServiceImpl;
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping
    public PromptDTO createPrompt(@RequestBody PromptDTO promptDTO) {
        Prompt prompt = promptServiceImpl.create(promptDTO);
        return promptServiceImpl.mapToDTO(prompt);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping
    public PromptDTO getPrompt(){
        Prompt prompt = promptServiceImpl.get();
        return promptServiceImpl.mapToDTO(prompt);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping
    public PromptDTO updatePrompt(@RequestBody PromptDTO promptDTO){
        Prompt prompt = promptServiceImpl.update(promptDTO);
        return promptServiceImpl.mapToDTO(prompt);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping
    public String deletePrompt(){
        promptServiceImpl.delete();
        return "Промпт был успешно удален";
    }
}
