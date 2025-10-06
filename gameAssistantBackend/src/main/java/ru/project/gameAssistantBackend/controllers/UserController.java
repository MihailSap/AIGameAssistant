package ru.project.gameAssistantBackend.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.project.gameAssistantBackend.dto.UpdatePasswordDTO;
import ru.project.gameAssistantBackend.dto.UserDataDTO;
import ru.project.gameAssistantBackend.service.UserService;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public UserDataDTO getUser(@PathVariable("id") Long id){
        var user = userService.getById(id);
        return userService.mapToDTO(user);
    }

    @PatchMapping("/{id}/update/password")
    public void updatePassword(@PathVariable("id") Long id, @RequestBody UpdatePasswordDTO updatePasswordDTO){
        userService.updatePassword(id, updatePasswordDTO);
    }
}
