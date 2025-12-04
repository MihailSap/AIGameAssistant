package ru.project.gameAssistantBackend.service;

import reactor.core.publisher.Flux;
import ru.project.gameAssistantBackend.models.Message;

import java.util.List;
import java.util.function.Consumer;

public interface AssistantService {

    Flux<String> getStreamedAnswer(List<Message> messages, Consumer<String> onComplete);
}
