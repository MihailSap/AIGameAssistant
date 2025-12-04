package ru.project.gameAssistantBackend.models;

import jakarta.persistence.*;
import ru.project.gameAssistantBackend.enums.Model;

import java.util.Objects;

@Entity
@Table(name = "system_properties")
public class SystemProperties {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String prompt;

    @Enumerated(EnumType.STRING)
    private Model model;

    public SystemProperties(Long id, String prompt, Model model) {
        this.id = id;
        this.prompt = prompt;
        this.model = model;
    }

    public SystemProperties() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String text) {
        this.prompt = text;
    }

    public Model getModel() {
        return model;
    }

    public void setModel(Model model) {
        this.model = model;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SystemProperties systemProperties = (SystemProperties) o;
        return Objects.equals(id, systemProperties.id) && Objects.equals(prompt, systemProperties.prompt);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, prompt);
    }
}
