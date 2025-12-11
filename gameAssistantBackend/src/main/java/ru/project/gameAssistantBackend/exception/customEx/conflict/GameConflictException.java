package ru.project.gameAssistantBackend.exception.customEx.conflict;

import ru.project.gameAssistantBackend.exception.globalEx.GameAssistantConflictException;

public class GameConflictException extends GameAssistantConflictException {
    public GameConflictException(String message) {
        super(message);
    }
}
