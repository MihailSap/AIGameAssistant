package ru.project.gameAssistantBackend.models;

import jakarta.persistence.*;
import ru.project.gameAssistantBackend.enums.ChatRole;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "chat")
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "uzer_id", nullable = false)
    private User uzer;

    @ManyToOne
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    private String title;

    private Instant lastUseTime;

    @OneToMany(mappedBy="chat", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Message> messages = new ArrayList<>();

    public Chat(Long id, String title, Instant lastUsedTime, User uzer, List<Message> messages) {
        this.id = id;
        this.title = title;
        this.lastUseTime = lastUsedTime;
        this.uzer = uzer;
        this.messages = messages;
    }

    public Chat() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUzer() {
        return uzer;
    }

    public void setUzer(User uzer) {
        this.uzer = uzer;
    }

    public List<Message> getMessages() {
        return messages;
    }

    public void setMessages(List<Message> messages) {
        this.messages = messages;
    }

    public Game getGame() {
        return game;
    }

    public void setGame(Game game) {
        this.game = game;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Instant getLastUseTime() {
        return lastUseTime;
    }

    public void setLastUseTime(Instant lastUseTime) {
        this.lastUseTime = lastUseTime;
    }

    public void addMessage(Message message){
        this.messages.add(message);
    }

    public Message addMessage(String text, ChatRole role) {
        Message message = new Message();
        message.setText(text);
        message.setRole(role);
        message.setTimestamp(Instant.now());
        message.setChat(this);
        this.messages.add(message);
        return message;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Chat chat = (Chat) o;
        return Objects.equals(id, chat.id) && Objects.equals(uzer, chat.uzer) && Objects.equals(messages, chat.messages);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, uzer, messages);
    }
}
