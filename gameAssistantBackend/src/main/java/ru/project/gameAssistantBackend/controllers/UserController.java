package ru.project.gameAssistantBackend.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.project.gameAssistantBackend.dto.ResponseDTO;
import ru.project.gameAssistantBackend.dto.UpdatePasswordDTO;
import ru.project.gameAssistantBackend.dto.UserRequestDTO;
import ru.project.gameAssistantBackend.dto.UserResponseDTO;
import ru.project.gameAssistantBackend.models.JwtAuthentication;
import ru.project.gameAssistantBackend.models.User;
import ru.project.gameAssistantBackend.service.AuthService;
import ru.project.gameAssistantBackend.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    @GetMapping("/{id}")
    public UserResponseDTO getUser(@PathVariable("id") Long id){
        var user = userService.getById(id);
        return userService.mapToResponseDTO(user);
    }

    @PatchMapping("/{id}/update/password")
    public void updatePassword(@PathVariable("id") Long id, @RequestBody UpdatePasswordDTO updatePasswordDTO){
        userService.updatePassword(id, updatePasswordDTO);
    }

    @PatchMapping("/{id}/update/image")
    public UserResponseDTO updateImage(@PathVariable("id") Long id, @ModelAttribute UserRequestDTO userRequestDTO){
        User user = userService.updateImage(id, userRequestDTO.imageFile());
        return userService.mapToResponseDTO(user);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/authenticated")
    public UserResponseDTO getAuthenticatedUser() {
        final JwtAuthentication authInfo = authService.getAuthInfo();
        var personEmail = authInfo.getPrincipal().toString();
        return userService.getResponseDTOByEmail(personEmail);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping
    public List<UserResponseDTO> getAllUsers() {
        var usersData = userService.getAllUsers();
        return userService.mapAllUsersDTO(usersData);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable("id") Long id){
        userService.deleteUser(id);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/{id}/make-admin")
    public ResponseDTO makeAdmin(@PathVariable("id") Long id){
        userService.makeUserAdmin(id);
        String message = String.format("Пользователь с id = %d теперь имеет роль ADMIN", id);
        return new ResponseDTO(message);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/{id}/make-not-admin")
    public ResponseDTO makeNotAdmin(@PathVariable("id") Long id){
        userService.makeAdminUser(id);
        String message = String.format("Пользователь с id = %d теперь имеет роль USER", id);
        return new ResponseDTO(message);
    }
}
