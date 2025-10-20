package ru.project.gameAssistantBackend.models;

import jakarta.persistence.*;

import java.util.Objects;

@Entity
@Table(name = "prompt")
public class Prompt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String text;

    public Prompt(Long id, String text) {
        this.id = id;
        this.text = text;
    }

    public Prompt() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Prompt prompt = (Prompt) o;
        return Objects.equals(id, prompt.id) && Objects.equals(text, prompt.text);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, text);
    }
}
