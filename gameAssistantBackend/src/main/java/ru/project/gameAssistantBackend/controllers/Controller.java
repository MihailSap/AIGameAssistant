package ru.project.gameAssistantBackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.project.gameAssistantBackend.models.JwtAuthentication;
import ru.project.gameAssistantBackend.service.AuthService;

@RestController
@RequestMapping("/api")
public class Controller {

    private final AuthService authService;

    @Autowired
    public Controller(AuthService authService) {
        this.authService = authService;
    }

    @PreAuthorize("hasAuthority('USER')")
    @GetMapping("/hello/user")
    public ResponseEntity<String> helloUser(){
        final JwtAuthentication authInfo = authService.getAuthInfo();
        return ResponseEntity.ok("Hello user " + authInfo.getPrincipal() + "!");
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/hello/admin")
    public ResponseEntity<String> helloAdmin(){
        final JwtAuthentication authInfo = authService.getAuthInfo();
        return ResponseEntity.ok("Hello admin " + authInfo.getPrincipal() + "!");
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/hello/authenticated")
    public ResponseEntity<String> helloAuthenticated() {
        final JwtAuthentication authInfo = authService.getAuthInfo();
        return ResponseEntity.ok("Привет, " + authInfo.getUsername() + "! Ты успешно аутентифицирован");
    }
}
