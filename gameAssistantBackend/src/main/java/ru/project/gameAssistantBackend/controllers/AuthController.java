package ru.project.gameAssistantBackend.controllers;

import jakarta.security.auth.message.AuthException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.project.gameAssistantBackend.dto.jwt.JwtRequest;
import ru.project.gameAssistantBackend.dto.jwt.JwtResponse;
import ru.project.gameAssistantBackend.dto.jwt.RefreshJwtRequest;
import ru.project.gameAssistantBackend.dto.user.UserRequestDTO;
import ru.project.gameAssistantBackend.dto.user.UserResponseDTO;
import ru.project.gameAssistantBackend.models.User;
import ru.project.gameAssistantBackend.service.impl.AuthServiceImpl;
import ru.project.gameAssistantBackend.service.impl.UserServiceImpl;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthServiceImpl authServiceImpl;

    private final UserServiceImpl userServiceImpl;

    @Autowired
    public AuthController(AuthServiceImpl authServiceImpl, UserServiceImpl userServiceImpl) {
        this.authServiceImpl = authServiceImpl;
        this.userServiceImpl = userServiceImpl;
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody JwtRequest authRequest) throws AuthException {
        final JwtResponse token = authServiceImpl.login(authRequest);
        return ResponseEntity.ok(token);
    }

    @PostMapping("/register")
    public UserResponseDTO registration(@ModelAttribute UserRequestDTO userRequestDTO){
        User user = authServiceImpl.register(userRequestDTO);
        return userServiceImpl.mapToResponseDTO(user);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody RefreshJwtRequest request) throws AuthException {
        authServiceImpl.logout(request.refreshToken());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/token")
    public ResponseEntity<JwtResponse> getNewAccessToken(@RequestBody RefreshJwtRequest request) throws AuthException {
        final JwtResponse token = authServiceImpl.getAccessToken(request.refreshToken());
        return ResponseEntity.ok(token);
    }

    @PostMapping("/refresh")
    public ResponseEntity<JwtResponse> getNewRefreshToken(@RequestBody RefreshJwtRequest request) throws AuthException {
        final JwtResponse token = authServiceImpl.refresh(request.refreshToken());
        return ResponseEntity.ok(token);
    }
}
