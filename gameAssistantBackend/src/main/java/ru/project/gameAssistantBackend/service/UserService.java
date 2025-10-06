package ru.project.gameAssistantBackend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.project.gameAssistantBackend.dto.UpdatePasswordDTO;
import ru.project.gameAssistantBackend.dto.UserDataDTO;
import ru.project.gameAssistantBackend.enums.Role;
import ru.project.gameAssistantBackend.models.User;
import ru.project.gameAssistantBackend.repository.UserRepository;

import java.util.Optional;

@Slf4j
@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Optional<User> getByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User getById(Long id){
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Пользователь с таким id не найден"));
    }

    public UserDataDTO mapToDTO(User user) {
        return new UserDataDTO(
                user.getId(),
                user.getEmail(),
                user.getLogin(),
                user.getRole().equals(Role.ADMIN)
        );
    }

    @Transactional
    public void updatePassword(Long userId, UpdatePasswordDTO updatePasswordDTO){
        var user = getById(userId);
        var newEncodedPassword = passwordEncoder.encode(updatePasswordDTO.newPassword());
        user.setPassword(newEncodedPassword);
        userRepository.save(user);
        log.info("Пароль успешно обновлен");
    }
}
