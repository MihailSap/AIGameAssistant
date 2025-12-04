package ru.project.gameAssistantBackend.models;

import jakarta.persistence.*;
import ru.project.gameAssistantBackend.enums.Model;
import ru.project.gameAssistantBackend.enums.Role;

import java.util.HashSet;
import java.util.Set;

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

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Token refreshToken;

    private String imageFileTitle;

    @Enumerated(EnumType.STRING)
    private Model model;

    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(
            name = "uzer_favourites",
            joinColumns = @JoinColumn(name = "uzer_id"),
            inverseJoinColumns = @JoinColumn(name = "game_id")
    )
    private Set<Game> games = new HashSet<>();

    @OneToMany(mappedBy = "uzer")
    private Set<Chat> chats;

    public User(String email, String login, String password, Role role, String imageFileTitle) {
        this.email = email;
        this.login = login;
        this.password = password;
        this.role = role;
        this.imageFileTitle = imageFileTitle;
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

    public long getId() {
        return id;
    }

    public Token getRefreshToken() {
        return refreshToken;
    }

    public String getImageFileTitle() {
        return imageFileTitle;
    }

    public void setImageFileTitle(String imageFileTitle) {
        this.imageFileTitle = imageFileTitle;
    }

    public Set<Game> getGames() {
        return games;
    }

    public void setGames(Set<Game> games) {
        this.games = games;
    }

    public Model getModel() {
        return model;
    }

    public void setModel(Model model) {
        this.model = model;
    }

    public void addGame(Game game) {
        games.add(game);
        game.getUsers().add(this);
    }

    public void removeGame(Game game) {
        games.remove(game);
        game.getUsers().remove(this);
    }

    public void setRefreshToken(Token token) {
        this.refreshToken = token;
        if (token != null) {
            token.setUser(this);
        }
    }

//    @Override
//    public boolean equals(Object o) {
//        if (this == o) return true;
//        if (o == null || getClass() != o.getClass()) return false;
//        User user = (User) o;
//        return id == user.id && Objects.equals(email, user.email) && Objects.equals(login, user.login)
//                && Objects.equals(password, user.password) && role == user.role && Objects.equals(refreshToken, user.refreshToken)
//                && Objects.equals(imageFileTitle, user.imageFileTitle) && Objects.equals(games, user.games) && Objects.equals(chats, user.chats);
//    }
//
//    @Override
//    public int hashCode() {
//        return Objects.hash(id, email, login, password, role, refreshToken, imageFileTitle, games, chats);
//    }
}
