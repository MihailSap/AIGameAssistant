package ru.project.gameAssistantBackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.project.gameAssistantBackend.service.impl.AssistantServiceImpl;

@RestController
@RequestMapping("/api/ai")
public class AssistantController {

    private final AssistantServiceImpl assistantServiceImpl;

    @Autowired
    public AssistantController(AssistantServiceImpl assistantServiceImpl) {
        this.assistantServiceImpl = assistantServiceImpl;
    }

    @PostMapping("/ask")
    public String getAnswer(@RequestBody String prompt){
        return assistantServiceImpl.getAnswer(prompt);
    }
}
