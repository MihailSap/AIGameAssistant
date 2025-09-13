package ru.project.gameAssistantBackend.models;

import jakarta.persistence.*;
import ru.project.gameAssistantBackend.enums.Role;

@Entity
@Table(name = "uzer")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String email;

    private String login;

    private String password;

    private Role role;

    public User(String email, String login, String password, Role role) {
        this.email = email;
        this.login = login;
        this.password = password;
        this.role = role;
    }

    public User() {}

    public String getEmail() {
        return email;
    }

    public String getLogin() {
        return login;
    }

    public String getPassword() {
        return password;
    }

    public Role getRole() {
        return role;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setRole(Role roles) {
        this.role = roles;
    }
}
