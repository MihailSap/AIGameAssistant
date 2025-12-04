package ru.project.gameAssistantBackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.project.gameAssistantBackend.dto.ResponseDTO;
import ru.project.gameAssistantBackend.dto.user.UpdatePasswordDTO;
import ru.project.gameAssistantBackend.dto.user.UserRequestDTO;
import ru.project.gameAssistantBackend.dto.user.UserResponseDTO;
import ru.project.gameAssistantBackend.enums.Model;
import ru.project.gameAssistantBackend.jwt.JwtAuthentication;
import ru.project.gameAssistantBackend.models.User;
import ru.project.gameAssistantBackend.service.impl.AuthServiceImpl;
import ru.project.gameAssistantBackend.service.impl.UserServiceImpl;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserServiceImpl userServiceImpl;
    private final AuthServiceImpl authServiceImpl;

    @Autowired
    public UserController(UserServiceImpl userServiceImpl, AuthServiceImpl authServiceImpl) {
        this.userServiceImpl = userServiceImpl;
        this.authServiceImpl = authServiceImpl;
    }

    @GetMapping("/{id}")
    public UserResponseDTO getUser(@PathVariable("id") Long id){
        var user = userServiceImpl.getById(id);
        return userServiceImpl.mapToResponseDTO(user);
    }

    @PatchMapping("/{id}/update/password")
    public void updatePassword(@PathVariable("id") Long id, @RequestBody UpdatePasswordDTO updatePasswordDTO){
        userServiceImpl.updatePassword(id, updatePasswordDTO);
    }

    @PatchMapping("/{userId}/model")
    public void updateModel(@PathVariable("userId") Long userId, @RequestParam Model model){
        userServiceImpl.updateModel(userId, model);
    }

    @PatchMapping("/{id}/update/image")
    public UserResponseDTO updateImage(@PathVariable("id") Long id, @ModelAttribute UserRequestDTO userRequestDTO){
        User user = userServiceImpl.updateImage(id, userRequestDTO.imageFile());
        return userServiceImpl.mapToResponseDTO(user);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/authenticated")
    public UserResponseDTO getAuthenticatedUser() {
        final JwtAuthentication authInfo = authServiceImpl.getAuthInfo();
        var personEmail = authInfo.getPrincipal().toString();
        return userServiceImpl.getResponseDTOByEmail(personEmail);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping
    public List<UserResponseDTO> getAllUsers() {
        var usersData = userServiceImpl.getAllUsers();
        return userServiceImpl.mapAllUsersDTO(usersData);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable("id") Long id){
        userServiceImpl.deleteUser(id);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/{id}/make-admin")
    public ResponseDTO makeAdmin(@PathVariable("id") Long id){
        userServiceImpl.changeRole(id);
        String message = String.format("Пользователь с id = %d теперь имеет роль ADMIN", id);
        return new ResponseDTO(message);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/{id}/make-not-admin")
    public ResponseDTO makeNotAdmin(@PathVariable("id") Long id){
        userServiceImpl.changeRole(id);
        String message = String.format("Пользователь с id = %d теперь имеет роль USER", id);
        return new ResponseDTO(message);
    }
}
