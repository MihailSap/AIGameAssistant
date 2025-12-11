package ru.project.gameAssistantBackend.service.impl;

import io.jsonwebtoken.Claims;
import jakarta.security.auth.message.AuthException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ru.project.gameAssistantBackend.dto.jwt.JwtRequest;
import ru.project.gameAssistantBackend.dto.jwt.JwtResponse;
import ru.project.gameAssistantBackend.dto.user.UserRequestDTO;
import ru.project.gameAssistantBackend.enums.Role;
import ru.project.gameAssistantBackend.jwt.JwtAuthentication;
import ru.project.gameAssistantBackend.models.Token;
import ru.project.gameAssistantBackend.models.User;
import ru.project.gameAssistantBackend.repository.TokenRepository;
import ru.project.gameAssistantBackend.repository.UserRepository;
import ru.project.gameAssistantBackend.service.AuthServiceI;
import ru.project.gameAssistantBackend.jwt.JwtProvider;

@Service
public class AuthServiceImpl implements AuthServiceI {

    private final UserServiceImpl userServiceImpl;
    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;
    private final TokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileServiceImpl fileServiceImpl;

    @Autowired
    public AuthServiceImpl(UserServiceImpl userServiceImpl,
                           JwtProvider jwtProvider,
                           UserRepository userRepository,
                           TokenRepository tokenRepository,
                           PasswordEncoder passwordEncoder, FileServiceImpl fileServiceImpl) {
        this.userServiceImpl = userServiceImpl;
        this.jwtProvider = jwtProvider;
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.fileServiceImpl = fileServiceImpl;
    }

    @Transactional
    @Override
    public JwtResponse login(JwtRequest authRequest) throws AuthException {
        final User user = userServiceImpl.getByEmail(authRequest.getEmail())
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
    @Override
    public User register(UserRequestDTO userRequestDTO) {
        var email = userRequestDTO.email();
        if(userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Пользователь с таким email уже существует!");
        }

        var newUser = new User();
        newUser.setEmail(userRequestDTO.email());
        newUser.setLogin(userRequestDTO.login());
        newUser.setPassword(passwordEncoder.encode(userRequestDTO.password()));
        newUser.setRole(Role.USER);

        MultipartFile imageFile = userRequestDTO.imageFile();
        String imageFileTitle = fileServiceImpl.save(imageFile);
        newUser.setImageFileTitle(imageFileTitle);

        if(userRequestDTO.isAdmin()){
            newUser.setRole(Role.ADMIN);
        }

        return userRepository.save(newUser);
    }

    @Override
    public JwtResponse getAccessToken(String refreshToken) throws AuthException {
        if (jwtProvider.validateRefreshToken(refreshToken)) {
            final Claims claims = jwtProvider.getRefreshClaims(refreshToken);
            final String email = claims.getSubject();
            var user = userServiceImpl.getByEmail(email)
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
    @Override
    public JwtResponse refresh(String refreshToken) throws AuthException {
        if (jwtProvider.validateRefreshToken(refreshToken)) {
            final Claims claims = jwtProvider.getRefreshClaims(refreshToken);
            final String email = claims.getSubject();
            final User user = userServiceImpl.getByEmail(email)
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
    @Override
    public void logout(String refreshToken) throws AuthException {
        var token = tokenRepository.findByBody(refreshToken)
                .orElseThrow(() -> new AuthException("Токен не найден"));

        var user = token.getUser();
        user.setRefreshToken(null);
        userRepository.save(user);
    }

    @Override
    public JwtAuthentication getAuthInfo() {
        return (JwtAuthentication) SecurityContextHolder.getContext().getAuthentication();
    }

    @Override
    public String getAuthenticatedUserEmail(){
        return getAuthInfo().getPrincipal().toString();
    }

    public User getAuthenticatedUser(){
        String email = getAuthenticatedUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Авторизованный пользователь не найден"));
    }
}
