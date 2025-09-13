package ru.project.gameAssistantBackend.service;

import io.jsonwebtoken.Claims;
import jakarta.security.auth.message.AuthException;
import lombok.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.project.gameAssistantBackend.dto.JwtRequest;
import ru.project.gameAssistantBackend.dto.JwtResponse;
import ru.project.gameAssistantBackend.enums.Role;
import ru.project.gameAssistantBackend.models.JwtAuthentication;
import ru.project.gameAssistantBackend.models.User;
import ru.project.gameAssistantBackend.models.UserDTO;
import ru.project.gameAssistantBackend.repository.UserRepository;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private final UserService userService;
    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;
    private final Map<String, String> refreshStorage = new HashMap<>();

    @Autowired
    public AuthService(UserService userService, JwtProvider jwtProvider, UserRepository userRepository) {
        this.userService = userService;
        this.jwtProvider = jwtProvider;
        this.userRepository = userRepository;
    }

    public JwtResponse login(@NonNull JwtRequest authRequest) throws AuthException {
        final User user = userService.getByEmail(authRequest.getEmail())
                .orElseThrow(() -> new AuthException("Пользователь не найден"));
        if (user.getPassword().equals(authRequest.getPassword())) {
            final String accessToken = jwtProvider.generateAccessToken(user);
            final String refreshToken = jwtProvider.generateRefreshToken(user);
            refreshStorage.put(user.getEmail(), refreshToken);
            return new JwtResponse(accessToken, refreshToken);
        } else {
            throw new AuthException("Неправильный пароль");
        }
    }

    @Transactional
    public void register(UserDTO userDTO) {
        var email = userDTO.getEmail();
        if(userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Пользователь с таким email уже существует!");
        }
        var newUser = new User(
                userDTO.getEmail(),
                userDTO.getLogin(),
                userDTO.getPassword(),
                Role.ADMIN
        );
        userRepository.save(newUser);
    }

    public JwtResponse getAccessToken(@NonNull String refreshToken) throws AuthException {
        if (jwtProvider.validateRefreshToken(refreshToken)) {
            final Claims claims = jwtProvider.getRefreshClaims(refreshToken);
            final String email = claims.getSubject();
            final String saveRefreshToken = refreshStorage.get(email);
            if (saveRefreshToken != null && saveRefreshToken.equals(refreshToken)) {
                final User user = userService.getByEmail(email)
                        .orElseThrow(() -> new AuthException("Пользователь не найден"));
                final String accessToken = jwtProvider.generateAccessToken(user);
                return new JwtResponse(accessToken, null);
            }
        }
        return new JwtResponse(null, null);
    }

    public JwtResponse refresh(@NonNull String refreshToken) throws AuthException {
        if (jwtProvider.validateRefreshToken(refreshToken)) {
            final Claims claims = jwtProvider.getRefreshClaims(refreshToken);
            final String email = claims.getSubject();
            final String saveRefreshToken = refreshStorage.get(email);
            if (saveRefreshToken != null && saveRefreshToken.equals(refreshToken)) {
                final User user = userService.getByEmail(email)
                        .orElseThrow(() -> new AuthException("Пользователь не найден"));
                final String accessToken = jwtProvider.generateAccessToken(user);
                final String newRefreshToken = jwtProvider.generateRefreshToken(user);
                refreshStorage.put(user.getLogin(), newRefreshToken);
                return new JwtResponse(accessToken, newRefreshToken);
            }
        }
        throw new AuthException("Невалидный JWT токен");
    }

    public JwtAuthentication getAuthInfo() {
        return (JwtAuthentication) SecurityContextHolder.getContext().getAuthentication();
    }
}
