package ru.project.gameAssistantBackend.service;

import org.springframework.web.multipart.MultipartFile;
import ru.project.gameAssistantBackend.dto.user.UpdatePasswordDTO;
import ru.project.gameAssistantBackend.models.User;

import java.util.List;
import java.util.Optional;

public interface UserServiceI {

    Optional<User> getByEmail(String email);

    User getResponseDTOByEmail(String email);

    User getById(Long id);

    void updatePassword(Long userId, UpdatePasswordDTO updatePasswordDTO);

    User updateImage(Long userId, MultipartFile imageFile);

    List<User> getAllUsers();

    void deleteUser(Long userId);

    void changeRole(Long id);
}
