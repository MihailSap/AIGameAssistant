package ru.project.gameAssistantBackend.models;

import jakarta.persistence.*;
import ru.project.gameAssistantBackend.enums.GameCategory;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "game")
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String description;

    @Enumerated(EnumType.STRING)
    private GameCategory category;

    private String imageFileTitle;

    private String rulesFileTitle;

    @ManyToMany(mappedBy = "games")
    private Set<User> users = new HashSet<>();

    @OneToMany(mappedBy = "game")
    private Set<Chat> chats;

    public Game(Long id, String title, String description, GameCategory category, String imageFileTitle, String rulesFileTitle) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.imageFileTitle = imageFileTitle;
        this.rulesFileTitle = rulesFileTitle;
    }

    public Game() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageFileTitle() {
        return imageFileTitle;
    }

    public void setImageFileTitle(String imageFileTitle) {
        this.imageFileTitle = imageFileTitle;
    }

    public String getRulesFileTitle() {
        return rulesFileTitle;
    }

    public void setRulesFileTitle(String rulesFileTitle) {
        this.rulesFileTitle = rulesFileTitle;
    }

    public Set<User> getUsers() {
        return users;
    }

    public void setUsers(Set<User> users) {
        this.users = users;
    }

    public Set<Chat> getChats() {
        return chats;
    }

    public void setChats(Set<Chat> chats) {
        this.chats = chats;
    }

    public GameCategory getCategory() {
        return category;
    }

    public void setCategory(GameCategory gameCategory) {
        this.category = gameCategory;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Game game = (Game) o;
        return Objects.equals(id, game.id) && Objects.equals(title, game.title)
                && Objects.equals(description, game.description)
                && category == game.category
                && Objects.equals(imageFileTitle, game.imageFileTitle)
                && Objects.equals(rulesFileTitle, game.rulesFileTitle)
                && Objects.equals(users, game.users)
                && Objects.equals(chats, game.chats);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, title, description, category, imageFileTitle, rulesFileTitle, users, chats);
    }

    @Override
    public String toString() {
        return "Game{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", gameCategory=" + category +
                ", imageFileTitle='" + imageFileTitle + '\'' +
                ", rulesFileTitle='" + rulesFileTitle + '\'' +
                ", users=" + users +
                ", chats=" + chats +
                '}';
    }
}
