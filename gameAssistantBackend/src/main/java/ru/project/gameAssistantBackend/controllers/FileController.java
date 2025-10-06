package ru.project.gameAssistantBackend.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.project.gameAssistantBackend.service.FileService;

@RestController
@RequestMapping("/api/file")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @GetMapping("/image/{imageFileTitle}")
    public ResponseEntity<Resource> getImageFile(@PathVariable("imageFileTitle") String imageFileTitle) throws Exception {
        var resource = fileService.getFile(imageFileTitle);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(resource);
    }

    @GetMapping("/rules/{rulesFileTitle}")
    public ResponseEntity<Resource> getRulesFile(@PathVariable("rulesFileTitle") String rulesFileTitle) throws Exception {
        var resource = fileService.getFile(rulesFileTitle);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }
}
