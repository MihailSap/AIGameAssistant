package ru.project.gameAssistantBackend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ru.project.gameAssistantBackend.dto.UpdatePasswordDTO;
import ru.project.gameAssistantBackend.dto.UserResponseDTO;
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
    private final FileService fileService;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, FileService fileService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.fileService = fileService;
    }

    public Optional<User> getByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public UserResponseDTO getResponseDTOByEmail(String email) {
        var user = getByEmail(email).orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        return mapToResponseDTO(user);
    }

    public User getById(Long id){
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Пользователь с таким id не найден"));
    }

    public UserResponseDTO mapToResponseDTO(User user) {
        return new UserResponseDTO(
                user.getId(),
                user.getEmail(),
                user.getLogin(),
                user.getRole().equals(Role.ADMIN),
                user.getImageFileTitle()
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

    @Transactional
    public User updateImage(Long userId, MultipartFile imageFile){
        User user = getById(userId);

        var oldUserImageTitle = user.getImageFileTitle();
        fileService.delete(oldUserImageTitle);

        var newUserImageTitle = fileService.save(imageFile);
        user.setImageFileTitle(newUserImageTitle);
        userRepository.save(user);

        return user;
    }

    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

    public List<UserResponseDTO> mapAllUsersDTO(List<User> users){
        List<UserResponseDTO> userResponseDTOS = new ArrayList<>();
        for(var user : users){
            userResponseDTOS.add(mapToResponseDTO(user));
        }
        return userResponseDTOS;
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
