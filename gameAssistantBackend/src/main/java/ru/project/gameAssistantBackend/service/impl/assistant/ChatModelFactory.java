package ru.project.gameAssistantBackend.service.impl.assistant;

import org.springframework.stereotype.Component;
import ru.project.gameAssistantBackend.service.AssistantService;

import java.util.Map;

@Component
public class ChatModelFactory {

    private final Map<String, AssistantService> models;

    public ChatModelFactory(Map<String, AssistantService> models) {
        this.models = models;
    }

    public AssistantService getModel(String name) {
        AssistantService model = models.get(name.toLowerCase());
        if (model == null) {
            throw new IllegalArgumentException("Unknown model: " + name);
        }
        return model;
    }
}
