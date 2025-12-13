package ru.project.gameAssistantBackend.exception.handler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import ru.project.gameAssistantBackend.dto.ResponseDTO;
import ru.project.gameAssistantBackend.exception.globalEx.GameAssistantConflictException;
import ru.project.gameAssistantBackend.exception.globalEx.GameAssistantInvalidException;
import ru.project.gameAssistantBackend.exception.globalEx.GameAssistantNotFoundException;

@ControllerAdvice
public class GlobalExceptionHandler {

    private final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(GameAssistantNotFoundException.class)
    public ResponseEntity<ResponseDTO> handleNotFoundEx(GameAssistantNotFoundException ex) {
        logger.error("NotFoundException: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ResponseDTO(ex.getMessage()));
    }

    @ExceptionHandler(GameAssistantConflictException.class)
    public ResponseEntity<ResponseDTO> handleConflictEx(GameAssistantConflictException ex) {
        logger.error("ConflictException: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ResponseDTO(ex.getMessage()));
    }

    @ExceptionHandler(GameAssistantInvalidException.class)
    public ResponseEntity<ResponseDTO> handleInvalidException(GameAssistantInvalidException ex) {
        logger.error("InvalidException: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ResponseDTO(ex.getMessage()));
    }
}
