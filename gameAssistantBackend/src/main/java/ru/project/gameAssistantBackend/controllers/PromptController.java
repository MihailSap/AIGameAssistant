package ru.project.gameAssistantBackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.project.gameAssistantBackend.dto.chat.PromptDTO;
import ru.project.gameAssistantBackend.models.Prompt;
import ru.project.gameAssistantBackend.service.PromptService;

@RestController
@RequestMapping("/api/prompt")
public class PromptController {

    private final PromptService promptService;

    @Autowired
    public PromptController(PromptService promptService) {
        this.promptService = promptService;
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping
    public PromptDTO createPrompt(@RequestBody PromptDTO promptDTO) {
        Prompt prompt = promptService.create(promptDTO);
        return promptService.mapToDTO(prompt);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping
    public PromptDTO getPrompt(){
        Prompt prompt = promptService.get();
        return promptService.mapToDTO(prompt);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping
    public PromptDTO updatePrompt(@RequestBody PromptDTO promptDTO){
        Prompt prompt = promptService.update(promptDTO);
        return promptService.mapToDTO(prompt);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping
    public String deletePrompt(){
        promptService.delete();
        return "Промпт был успешно удален";
    }
}
