package ru.project.gameAssistantBackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.project.gameAssistantBackend.dto.chat.SystemPropertiesDTO;
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
    public SystemPropertiesDTO getSystemProperties(){
        SystemProperties systemProperties = systemPropertiesServiceImpl.get();
        return systemPropertiesServiceImpl.mapToDTO(systemProperties);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/prompt")
    public String getPrompt(){
        return systemPropertiesServiceImpl.get().getPrompt();
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/model")
    public Model getModel(){
        return systemPropertiesServiceImpl.get().getModel();
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/prompt")
    public SystemPropertiesDTO updatePrompt(@RequestBody SystemPropertiesDTO systemPropertiesDTO){
        SystemProperties systemProperties = systemPropertiesServiceImpl.updatePrompt(systemPropertiesDTO);
        return systemPropertiesServiceImpl.mapToDTO(systemProperties);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/model")
    public SystemPropertiesDTO updateModel(@RequestBody SystemPropertiesDTO systemPropertiesDTO){
        SystemProperties systemProperties = systemPropertiesServiceImpl.updateModel(systemPropertiesDTO);
        return systemPropertiesServiceImpl.mapToDTO(systemProperties);
    }
}
