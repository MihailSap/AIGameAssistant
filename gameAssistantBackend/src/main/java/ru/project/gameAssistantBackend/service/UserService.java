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

import java.util.ArrayList;
import java.util.List;
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

    public UserDataDTO getUserDataDTOByEmail(String email) {
        var user = getByEmail(email).orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        return mapToDTO(user);
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

    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

    public List<UserDataDTO> mapAllUsersDTO(List<User> users){
        List<UserDataDTO> userDataDTOs = new ArrayList<>();
        for(var user : users){
            userDataDTOs.add(mapToDTO(user));
        }
        return userDataDTOs;
    }

    @Transactional
    public void deleteUser(Long userId){
        var user = getById(userId);
        userRepository.delete(user);
    }

    @Transactional
    public void makeUserAdmin(Long id){
        var user = getById(id);
        user.setRole(Role.ADMIN);
        userRepository.save(user);
    }

    public void makeAdminUser(Long id){
        var user = getById(id);
        user.setRole(Role.USER);
        userRepository.save(user);
    }
}
