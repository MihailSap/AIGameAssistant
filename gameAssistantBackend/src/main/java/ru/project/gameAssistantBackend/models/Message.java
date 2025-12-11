package ru.project.gameAssistantBackend.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "message")
public class Message extends BaseEntity {

    private ChatRole role;

    private String text;

    private Instant timestamp;

    @ManyToOne
    @JoinColumn(name = "chat_id", nullable = false)
    @JsonIgnore
    private Chat chat;

    public Message(Long id, ChatRole role, String text, Chat chat, Instant timestamp) {
        this.setId(id);
        this.role = role;
        this.text = text;
        this.chat = chat;
        this.timestamp = timestamp;
    }

    public Message() {}

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
    public String toString() {
        return """
                {
                    "role":\"%s\",
                    "text":\"%s\"
                }""".formatted(role, text);
    }
}
