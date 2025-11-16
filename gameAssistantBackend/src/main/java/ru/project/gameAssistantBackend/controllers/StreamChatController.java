package ru.project.gameAssistantBackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import ru.project.gameAssistantBackend.service.impl.StreamAssistantService;

@RestController
@RequestMapping("/api/stream")
public class StreamChatController {

    private final StreamAssistantService streamAssistantService;

    @Autowired
    public StreamChatController(StreamAssistantService streamAssistantService) {
        this.streamAssistantService = streamAssistantService;
    }

    @GetMapping(value = "/ask", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> askStream(@RequestParam String prompt) {
        return streamAssistantService.getStreamedAnswer(prompt);
    }
}
