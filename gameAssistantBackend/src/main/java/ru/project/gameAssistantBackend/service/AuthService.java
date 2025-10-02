package ru.project.gameAssistantBackend.service;

import io.jsonwebtoken.Claims;
import jakarta.security.auth.message.AuthException;
import lombok.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.project.gameAssistantBackend.dto.JwtRequest;
import ru.project.gameAssistantBackend.dto.JwtResponse;
import ru.project.gameAssistantBackend.dto.UserDTO;
import ru.project.gameAssistantBackend.enums.Role;
import ru.project.gameAssistantBackend.models.JwtAuthentication;
import ru.project.gameAssistantBackend.models.Token;
import ru.project.gameAssistantBackend.models.User;
import ru.project.gameAssistantBackend.repository.TokenRepository;
import ru.project.gameAssistantBackend.repository.UserRepository;

@Service
public class AuthService {

    private final UserService userService;
    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;
    private final TokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AuthService(UserService userService, JwtProvider jwtProvider, UserRepository userRepository, TokenRepository tokenRepository, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.jwtProvider = jwtProvider;
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public JwtResponse login(@NonNull JwtRequest authRequest) throws AuthException {
        final User user = userService.getByEmail(authRequest.getEmail())
                .orElseThrow(() -> new AuthException("Пользователь не найден"));

        if (passwordEncoder.matches(authRequest.getPassword(), user.getPassword())) {
            final String accessToken = jwtProvider.generateAccessToken(user);
            final String refreshToken = jwtProvider.generateRefreshToken(user);

            if (user.getRefreshToken() != null) {
                user.getRefreshToken().setBody(refreshToken);
            } else {
                user.setRefreshToken(new Token(user, refreshToken));
            }

            userRepository.save(user);

            return new JwtResponse(accessToken, refreshToken);
        } else {
            throw new AuthException("Неправильный пароль");
        }
    }


    @Transactional
    public void register(UserDTO userDTO) {
        var email = userDTO.email();
        if(userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Пользователь с таким email уже существует!");
        }
        var newUser = new User(
                userDTO.email(),
                userDTO.login(),
                passwordEncoder.encode(userDTO.password()),
                Role.USER
        );

        if(userDTO.isAdmin()){
            newUser.setRole(Role.ADMIN);
        }

        userRepository.save(newUser);
    }

    public JwtResponse getAccessToken(@NonNull String refreshToken) throws AuthException {
        if (jwtProvider.validateRefreshToken(refreshToken)) {
            final Claims claims = jwtProvider.getRefreshClaims(refreshToken);
            final String email = claims.getSubject();
            var user = userService.getByEmail(email)
                        .orElseThrow(() -> new AuthException("Пользователь не найден"));
            var saveRefreshToken = tokenRepository.findByUser(user).get().getBody();
            if (saveRefreshToken != null && saveRefreshToken.equals(refreshToken)) {
                final String accessToken = jwtProvider.generateAccessToken(user);
                return new JwtResponse(accessToken, null);
            }
        }
        return new JwtResponse(null, null);
    }

    @Transactional
    public JwtResponse refresh(@NonNull String refreshToken) throws AuthException {
        if (jwtProvider.validateRefreshToken(refreshToken)) {
            final Claims claims = jwtProvider.getRefreshClaims(refreshToken);
            final String email = claims.getSubject();
            final User user = userService.getByEmail(email)
                    .orElseThrow(() -> new AuthException("Пользователь не найден"));
            var saveRefreshToken = tokenRepository.findByUser(user);
            if (saveRefreshToken.isPresent() && saveRefreshToken.get().getBody().equals(refreshToken)) {
                final String accessToken = jwtProvider.generateAccessToken(user);
                final String newRefreshToken = jwtProvider.generateRefreshToken(user);
                var existingToken = tokenRepository.findByUser(user)
                        .orElseThrow(() -> new AuthException("Токен не найден"));
                existingToken.setBody(newRefreshToken);
                tokenRepository.save(existingToken);
                return new JwtResponse(accessToken, newRefreshToken);
            }
        }
        throw new AuthException("Невалидный JWT токен");
    }

    @Transactional
    public void logout(String refreshToken) throws AuthException {
        var token = tokenRepository.findByBody(refreshToken)
                .orElseThrow(() -> new AuthException("Токен не найден"));

        var user = token.getUser();
        user.setRefreshToken(null);
        userRepository.save(user);
    }


    public JwtAuthentication getAuthInfo() {
        return (JwtAuthentication) SecurityContextHolder.getContext().getAuthentication();
    }
}
