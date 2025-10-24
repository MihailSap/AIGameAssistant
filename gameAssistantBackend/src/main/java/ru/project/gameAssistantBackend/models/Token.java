package ru.project.gameAssistantBackend.models;

import jakarta.persistence.*;

import java.util.Objects;

@Entity
@Table(name = "token")
public class Token {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String body;

    @OneToOne
    @JoinColumn(name = "uzer_id", nullable = false, unique = true)
    private User user;

    public Token(User user, String body) {
        this.user = user;
        this.body = body;
    }

    public Token() {}

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Token token = (Token) o;
        return id == token.id && Objects.equals(body, token.body) && Objects.equals(user, token.user);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, body, user);
    }
}
