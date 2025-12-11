package ru.project.gameAssistantBackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.project.gameAssistantBackend.dto.chat.SystemPropertiesDTO;
import ru.project.gameAssistantBackend.exception.customEx.notFound.SystemPropertiesNotFoundException;
import ru.project.gameAssistantBackend.models.Model;
import ru.project.gameAssistantBackend.models.SystemProperties;
import ru.project.gameAssistantBackend.service.impl.SystemPropertiesServiceImpl;

@RestController
@RequestMapping("/api/system")
public class SystemPropertiesController {

    private final SystemPropertiesServiceImpl systemPropertiesServiceImpl;

    @Autowired
    public SystemPropertiesController(SystemPropertiesServiceImpl systemPropertiesServiceImpl) {
        this.systemPropertiesServiceImpl = systemPropertiesServiceImpl;
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping
    public SystemPropertiesDTO getSystemProperties() throws SystemPropertiesNotFoundException {
        SystemProperties systemProperties = systemPropertiesServiceImpl.getSystemProperties();
        return mapToDTO(systemProperties);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/prompt")
    public String getPrompt() throws SystemPropertiesNotFoundException {
        return systemPropertiesServiceImpl.getSystemProperties().getPrompt();
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/model")
    public Model getModel() throws SystemPropertiesNotFoundException {
        return systemPropertiesServiceImpl.getSystemProperties().getModel();
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/prompt")
    public SystemPropertiesDTO updatePrompt(@RequestBody SystemPropertiesDTO systemPropertiesDTO) throws SystemPropertiesNotFoundException {
        SystemProperties systemProperties = systemPropertiesServiceImpl.updatePrompt(systemPropertiesDTO);
        return mapToDTO(systemProperties);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/model")
    public SystemPropertiesDTO updateModel(@RequestBody SystemPropertiesDTO systemPropertiesDTO) throws SystemPropertiesNotFoundException {
        SystemProperties systemProperties = systemPropertiesServiceImpl.updateModel(systemPropertiesDTO);
        return mapToDTO(systemProperties);
    }

    public SystemPropertiesDTO mapToDTO(SystemProperties systemProperties){
        return new SystemPropertiesDTO(
                systemProperties.getPrompt(), systemProperties.getModel());
    }
}
