package ru.project.gameAssistantBackend.service;

import org.springframework.stereotype.Service;
import ru.project.gameAssistantBackend.enums.Role;
import ru.project.gameAssistantBackend.models.User;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final List<User> users;

    public UserService(List<User> users) {
        this.users = List.of(
                new User("user@mail.com", "user", "1234", Collections.singleton(Role.USER)),
                new User("admin@mail.com", "admin", "1234", Collections.singleton(Role.ADMIN))
        );
    }

    public Optional<User> getByEmail(String email) {
        return users.stream()
                .filter(user -> user.getEmail().equals(email))
                .findFirst();
    }
}
