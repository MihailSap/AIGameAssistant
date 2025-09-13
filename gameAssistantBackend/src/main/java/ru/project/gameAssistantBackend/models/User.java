package ru.project.gameAssistantBackend.models;

import ru.project.gameAssistantBackend.enums.Role;

import java.util.Set;

public class User {
    private String email;
    private String login;
    private String password;
    private Set<Role> roles;

    public User(String email, String login, String password, Set<Role> roles) {
        this.email = email;
        this.login = login;
        this.password = password;
        this.roles = roles;
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

    public Set<Role> getRoles() {
        return roles;
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

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }
}
