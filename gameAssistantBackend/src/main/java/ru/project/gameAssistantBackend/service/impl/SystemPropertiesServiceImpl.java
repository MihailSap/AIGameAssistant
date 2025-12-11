package ru.project.gameAssistantBackend.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.project.gameAssistantBackend.dto.chat.SystemPropertiesDTO;
import ru.project.gameAssistantBackend.models.SystemProperties;
import ru.project.gameAssistantBackend.repository.SystemPropertiesRepository;
import ru.project.gameAssistantBackend.service.SystemPropertiesService;

@Service
public class SystemPropertiesServiceImpl implements SystemPropertiesService {

    private final SystemPropertiesRepository systemPropertiesRepository;

    @Autowired
    public SystemPropertiesServiceImpl(SystemPropertiesRepository systemPropertiesRepository) {
        this.systemPropertiesRepository = systemPropertiesRepository;
    }

    @Override
    public SystemProperties get(){
        return systemPropertiesRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Промпт не найден"));
    }

    @Override
    public String getPromptText(){
        return get().getPrompt();
    }

    @Transactional
    @Override
    public SystemProperties updatePrompt(SystemPropertiesDTO systemPropertiesDTO){
        SystemProperties systemProperties = get();
        systemProperties.setPrompt(systemPropertiesDTO.prompt());
        return systemPropertiesRepository.save(systemProperties);
    }

    @Transactional
    public SystemProperties updateModel(SystemPropertiesDTO systemPropertiesDTO){
        SystemProperties systemProperties = get();
        systemProperties.setModel(systemPropertiesDTO.model());
        return systemPropertiesRepository.save(systemProperties);
    }

    @Override
    public SystemPropertiesDTO mapToDTO(SystemProperties systemProperties){
        return new SystemPropertiesDTO(
                systemProperties.getPrompt(), systemProperties.getModel());
    }
}
