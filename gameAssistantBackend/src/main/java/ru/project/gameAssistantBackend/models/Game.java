package ru.project.gameAssistantBackend.models;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@ToString
@Entity
@Table(name = "game")
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String description;

    private String imageFileTitle;

    private String rulesFileTitle;

    @ManyToMany(mappedBy = "games")
    private Set<User> users = new HashSet<>();

    public Game(Long id, String title, String description, String imageFileTitle, String rulesFileTitle) {
        this.id = id;
        this.title = title;
        this.description = description;
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
}
