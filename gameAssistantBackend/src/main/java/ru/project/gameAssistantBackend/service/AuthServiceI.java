package ru.project.gameAssistantBackend.service;

import jakarta.security.auth.message.AuthException;
import lombok.NonNull;
import ru.project.gameAssistantBackend.dto.jwt.JwtRequest;
import ru.project.gameAssistantBackend.dto.jwt.JwtResponse;
import ru.project.gameAssistantBackend.dto.user.UserRequestDTO;
import ru.project.gameAssistantBackend.jwt.JwtAuthentication;
import ru.project.gameAssistantBackend.models.User;

public interface AuthServiceI {

    JwtResponse login(@NonNull JwtRequest authRequest) throws AuthException;

    User register(UserRequestDTO userRequestDTO);

    JwtResponse getAccessToken(@NonNull String refreshToken) throws AuthException;

    JwtResponse refresh(@NonNull String refreshToken) throws AuthException;

    void logout(String refreshToken) throws AuthException;

    JwtAuthentication getAuthInfo();

    String getAuthenticatedUserEmail();
}
