package ru.project.gameAssistantBackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.project.gameAssistantBackend.dto.ResponseDTO;
import ru.project.gameAssistantBackend.dto.user.UpdatePasswordDTO;
import ru.project.gameAssistantBackend.dto.user.UserRequestDTO;
import ru.project.gameAssistantBackend.dto.user.UserResponseDTO;
import ru.project.gameAssistantBackend.exception.customEx.notFound.UserNotFoundException;
import ru.project.gameAssistantBackend.mapper.UserMapper;
import ru.project.gameAssistantBackend.models.Model;
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

    private final UserMapper userMapper;

    @Autowired
    public UserController(
            UserServiceImpl userServiceImpl,
            AuthServiceImpl authServiceImpl,
            UserMapper userMapper
    ) {
        this.userServiceImpl = userServiceImpl;
        this.authServiceImpl = authServiceImpl;
        this.userMapper = userMapper;
    }

    @GetMapping("/{userId}")
    public UserResponseDTO getUser(@PathVariable("userId") Long userId)
            throws UserNotFoundException {
        var user = userServiceImpl.getById(userId);
        return userMapper.mapToResponseDTO(user);
    }

    @PatchMapping("/{userId}/password")
    public void updatePassword(
            @PathVariable("userId") Long userId, @RequestBody UpdatePasswordDTO updatePasswordDTO)
            throws UserNotFoundException {
        userServiceImpl.updatePassword(userId, updatePasswordDTO);
    }

    @PatchMapping("/{userId}/model")
    public void updateModel(@PathVariable("userId") Long userId, @RequestParam Model model)
            throws UserNotFoundException {
        userServiceImpl.updateModel(userId, model);
    }

    @PatchMapping("/{userId}/image")
    public UserResponseDTO updateImage(
            @PathVariable("userId") Long userId, @ModelAttribute UserRequestDTO userRequestDTO)
            throws UserNotFoundException {
        User user = userServiceImpl.updateImage(userId, userRequestDTO.imageFile());
        return userMapper.mapToResponseDTO(user);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/authenticated")
    public UserResponseDTO getAuthenticatedUser() throws UserNotFoundException {
        final JwtAuthentication authInfo = authServiceImpl.getAuthInfo();
        var personEmail = authInfo.getPrincipal().toString();
        User user = userServiceImpl.getByEmail(personEmail);
        return userMapper.mapToResponseDTO(user);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping
    public List<UserResponseDTO> getAllUsers() {
        var usersData = userServiceImpl.getAllUsers();
        return userMapper.mapAllUsersDTO(usersData);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{userId}")
    public void delete(@PathVariable("userId") Long userId) throws UserNotFoundException {
        userServiceImpl.deleteUser(userId);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/{userId}/make-admin")
    public ResponseDTO makeAdmin(@PathVariable("userId") Long userId) throws UserNotFoundException {
        userServiceImpl.updateRole(userId);
        return new ResponseDTO(String.format(
                "Пользователь с id = %d теперь имеет роль ADMIN", userId));
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/{userId}/make-not-admin")
    public ResponseDTO makeNotAdmin(@PathVariable("userId") Long userId) throws UserNotFoundException {
        userServiceImpl.updateRole(userId);
        return new ResponseDTO(String.format(
                "Пользователь с id = %d теперь имеет роль USER", userId));
    }
}
