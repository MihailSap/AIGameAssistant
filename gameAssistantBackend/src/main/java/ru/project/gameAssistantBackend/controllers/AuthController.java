package ru.project.gameAssistantBackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.project.gameAssistantBackend.dto.jwt.JwtRequest;
import ru.project.gameAssistantBackend.dto.jwt.JwtResponse;
import ru.project.gameAssistantBackend.dto.jwt.RefreshJwtRequest;
import ru.project.gameAssistantBackend.dto.user.UserRequestDTO;
import ru.project.gameAssistantBackend.dto.user.UserResponseDTO;
import ru.project.gameAssistantBackend.exception.customEx.conflict.UserConflictException;
import ru.project.gameAssistantBackend.exception.customEx.invalid.PasswordInvalidException;
import ru.project.gameAssistantBackend.exception.customEx.invalid.TokenInvalidException;
import ru.project.gameAssistantBackend.exception.customEx.notFound.TokenNotFoundException;
import ru.project.gameAssistantBackend.exception.customEx.notFound.UserNotFoundException;
import ru.project.gameAssistantBackend.mapper.UserMapper;
import ru.project.gameAssistantBackend.models.User;
import ru.project.gameAssistantBackend.service.impl.AuthServiceImpl;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthServiceImpl authServiceImpl;

    private final UserMapper userMapper;

    @Autowired
    public AuthController(
            AuthServiceImpl authServiceImpl,
            UserMapper userMapper
    ) {
        this.authServiceImpl = authServiceImpl;
        this.userMapper = userMapper;
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody JwtRequest authRequest)
            throws UserNotFoundException, PasswordInvalidException {
        final JwtResponse token = authServiceImpl.login(authRequest);
        return ResponseEntity.ok(token);
    }

    @PostMapping("/register")
    public UserResponseDTO registration(@ModelAttribute UserRequestDTO userRequestDTO)
            throws UserConflictException {
        User user = authServiceImpl.register(userRequestDTO);
        return userMapper.mapToResponseDTO(user);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody RefreshJwtRequest request)
            throws TokenNotFoundException {
        authServiceImpl.logout(request.refreshToken());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/token")
    public ResponseEntity<JwtResponse> getNewAccessToken(@RequestBody RefreshJwtRequest request)
            throws UserNotFoundException {
        final JwtResponse token = authServiceImpl.getAccessToken(request.refreshToken());
        return ResponseEntity.ok(token);
    }

    @PostMapping("/refresh")
    public ResponseEntity<JwtResponse> getNewRefreshToken(@RequestBody RefreshJwtRequest request)
            throws UserNotFoundException, TokenNotFoundException, TokenInvalidException {
        final JwtResponse token = authServiceImpl.refresh(request.refreshToken());
        return ResponseEntity.ok(token);
    }
}
