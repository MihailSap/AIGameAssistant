package ru.project.gameAssistantBackend.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.project.gameAssistantBackend.service.YandexGPTService;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final YandexGPTService yandexGPTService;

    @PostMapping("/ask")
    public String getAnswer(@RequestBody String prompt){
        return yandexGPTService.getAnswer(prompt);
    }
}
