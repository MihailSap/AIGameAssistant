package ru.project.gameAssistantBackend.service;

import org.springframework.web.multipart.MultipartFile;
import ru.project.gameAssistantBackend.dto.user.UpdatePasswordDTO;
import ru.project.gameAssistantBackend.dto.user.UserResponseDTO;
import ru.project.gameAssistantBackend.models.User;

import java.util.List;
import java.util.Optional;

public interface UserServiceI {

    Optional<User> getByEmail(String email);

    UserResponseDTO getResponseDTOByEmail(String email);

    User getById(Long id);

    UserResponseDTO mapToResponseDTO(User user);

    void updatePassword(Long userId, UpdatePasswordDTO updatePasswordDTO);

    User updateImage(Long userId, MultipartFile imageFile);

    List<User> getAllUsers();

    List<UserResponseDTO> mapAllUsersDTO(List<User> users);

    void deleteUser(Long userId);

    void changeRole(Long id);
}
