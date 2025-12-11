package ru.project.gameAssistantBackend.models;

import jakarta.persistence.*;

import java.util.Objects;

@Entity
@Table(name = "system_properties")
public class SystemProperties extends BaseEntity {

    private String prompt;

    @Enumerated(EnumType.STRING)
    private Model model;

    public SystemProperties(Long id, String prompt, Model model) {
        this.setId(id);
        this.prompt = prompt;
        this.model = model;
    }

    public SystemProperties() {}

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
}
