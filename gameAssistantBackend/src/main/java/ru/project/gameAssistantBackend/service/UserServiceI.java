package ru.project.gameAssistantBackend.service;

import org.springframework.web.multipart.MultipartFile;
import ru.project.gameAssistantBackend.dto.user.UpdatePasswordDTO;
import ru.project.gameAssistantBackend.exception.customEx.notFound.UserNotFoundException;
import ru.project.gameAssistantBackend.models.User;

import java.util.List;

public interface UserServiceI {

    List<User> getAllUsers();

    User getByEmail(String email) throws UserNotFoundException;

    User getById(Long id) throws UserNotFoundException;

    void updatePassword(Long userId, UpdatePasswordDTO updatePasswordDTO) throws UserNotFoundException;

    User updateImage(Long userId, MultipartFile imageFile) throws UserNotFoundException;

    void updateRole(Long id) throws UserNotFoundException;

    void deleteUser(Long userId) throws UserNotFoundException;
}
