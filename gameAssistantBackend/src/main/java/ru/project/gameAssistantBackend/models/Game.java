package ru.project.gameAssistantBackend.models;

import jakarta.persistence.*;

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

    @ManyToMany
    @JoinTable(
            name = "game_category",
            joinColumns = @JoinColumn(name = "game_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<Category> categories = new HashSet<>();

    private String imageFileTitle;

    private String rulesFileTitle;

    @ManyToMany(mappedBy = "games")
    private Set<User> users = new HashSet<>();

    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Chat> chats;

    public Game(Long id, String title, String description, Set<Category> categories, String imageFileTitle, String rulesFileTitle) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.categories = categories;
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

    public Set<Category> getCategories() {
        return categories;
    }

    public void setCategories(Set<Category> gameCategory) {
        this.categories = gameCategory;
    }

    public void addCategory(Category category) {
        this.categories.add(category);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Game game = (Game) o;
        return Objects.equals(id, game.id) && Objects.equals(title, game.title)
                && Objects.equals(description, game.description)
                && categories == game.categories
                && Objects.equals(imageFileTitle, game.imageFileTitle)
                && Objects.equals(rulesFileTitle, game.rulesFileTitle)
                && Objects.equals(users, game.users)
                && Objects.equals(chats, game.chats);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, title, description, categories, imageFileTitle, rulesFileTitle, users, chats);
    }

    @Override
    public String toString() {
        return "Game{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", gameCategory=" + categories +
                ", imageFileTitle='" + imageFileTitle + '\'' +
                ", rulesFileTitle='" + rulesFileTitle + '\'' +
                ", users=" + users +
                ", chats=" + chats +
                '}';
    }
}
