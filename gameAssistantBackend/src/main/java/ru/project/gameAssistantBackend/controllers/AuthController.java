package ru.project.gameAssistantBackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.project.gameAssistantBackend.dto.ResetPasswordDTO;
import ru.project.gameAssistantBackend.dto.jwt.JwtRequest;
import ru.project.gameAssistantBackend.dto.jwt.JwtResponse;
import ru.project.gameAssistantBackend.dto.jwt.RefreshJwtRequest;
import ru.project.gameAssistantBackend.dto.user.UserRequestDTO;
import ru.project.gameAssistantBackend.dto.user.UserResponseDTO;
import ru.project.gameAssistantBackend.exception.customEx.conflict.UserConflictException;
import ru.project.gameAssistantBackend.exception.customEx.invalid.PasswordInvalidException;
import ru.project.gameAssistantBackend.exception.customEx.invalid.TokenInvalidException;
import ru.project.gameAssistantBackend.exception.customEx.notEnabled.AccountNotEnabledException;
import ru.project.gameAssistantBackend.exception.customEx.notFound.TokenNotFoundException;
import ru.project.gameAssistantBackend.exception.customEx.notFound.UserNotFoundException;
import ru.project.gameAssistantBackend.mapper.UserMapper;
import ru.project.gameAssistantBackend.models.User;
import ru.project.gameAssistantBackend.service.impl.AuthServiceImpl;
import ru.project.gameAssistantBackend.service.impl.UserServiceImpl;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthServiceImpl authServiceImpl;

    private final UserMapper userMapper;

    private final UserServiceImpl userServiceImpl;

    @Autowired
    public AuthController(
            AuthServiceImpl authServiceImpl,
            UserMapper userMapper,
            UserServiceImpl userServiceImpl
    ) {
        this.authServiceImpl = authServiceImpl;
        this.userMapper = userMapper;
        this.userServiceImpl = userServiceImpl;
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody JwtRequest authRequest)
            throws UserNotFoundException, PasswordInvalidException, AccountNotEnabledException {
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

    @GetMapping("/verify-email")
    public String verifyEmail(@RequestParam("token") String token) {
        boolean result = authServiceImpl.validateVerificationToken(token);
        return result ? "verified" : "not-verified";
    }

    @PostMapping("/forgot-password")
    public String requestForResetPassword(@RequestParam("email") String email)
            throws UserNotFoundException {
        User user = userServiceImpl.getByEmail(email);
        String token = authServiceImpl.setPasswordResetToken(user);
        authServiceImpl.sendPasswordResetEmail(email, token);
        return "Запрос на обновление пароля отправлен на указанный email";
    }

    @PatchMapping("/reset-password")
    public String resetPassword(@RequestBody ResetPasswordDTO resetPasswordDTO){
        User user = userServiceImpl.getUserByPasswordResetToken(resetPasswordDTO.token());
        authServiceImpl.setNullPasswordResetToken(user);
        userServiceImpl.updatePassword(user, resetPasswordDTO.password());
        return "Пароль успешно обновлен";
    }
}
