package ru.project.gameAssistantBackend.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import ru.project.gameAssistantBackend.enums.ChatRole;

import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "message")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private ChatRole role;

    private String text;

    private Instant timestamp;

    @ManyToOne
    @JoinColumn(name = "chat_id", nullable = false)
    @JsonIgnore
    private Chat chat;

    public Message(Long id, ChatRole role, String text, Chat chat, Instant timestamp) {
        this.id = id;
        this.role = role;
        this.text = text;
        this.chat = chat;
        this.timestamp = timestamp;
    }

    public Message() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ChatRole getRole() {
        return role;
    }

    public void setRole(ChatRole role) {
        this.role = role;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Chat getChat() {
        return chat;
    }

    public void setChat(Chat chat) {
        this.chat = chat;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Message message = (Message) o;
        return Objects.equals(id, message.id) && role == message.role && Objects.equals(text, message.text) && Objects.equals(chat, message.chat);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, role, text, chat);
    }

    @Override
    public String toString() {
        return """
                {
                    "role":\"%s\",
                    "text":\"%s\"
                }""".formatted(role, text);
    }
}
