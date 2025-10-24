package ru.project.gameAssistantBackend.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;

public interface FileServiceI {

    String save(MultipartFile file);

    void delete(String fileName);

    Resource getFileResource(String fileTitle) throws MalformedURLException;

    String extractTextFromPDF(String fileTitle) throws IOException;
}
