package ru.project.gameAssistantBackend.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.project.gameAssistantBackend.dto.UpdatePasswordDTO;
import ru.project.gameAssistantBackend.dto.UserDataDTO;
import ru.project.gameAssistantBackend.models.JwtAuthentication;
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
    public UserDataDTO getUser(@PathVariable("id") Long id){
        var user = userService.getById(id);
        return userService.mapToDTO(user);
    }

    @PatchMapping("/{id}/update/password")
    public void updatePassword(@PathVariable("id") Long id, @RequestBody UpdatePasswordDTO updatePasswordDTO){
        userService.updatePassword(id, updatePasswordDTO);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/authenticated")
    public UserDataDTO getAuthenticatedUser() {
        final JwtAuthentication authInfo = authService.getAuthInfo();
        var personEmail = authInfo.getPrincipal().toString();
        return userService.getUserDataDTOByEmail(personEmail);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping
    public List<UserDataDTO> getAllUsers() {
        var usersData = userService.getAllUsers();
        return userService.mapAllUsersDTO(usersData);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable("id") Long id){
        userService.deleteUser(id);
    }
}
