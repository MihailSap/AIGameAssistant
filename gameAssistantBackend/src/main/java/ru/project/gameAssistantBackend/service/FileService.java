package ru.project.gameAssistantBackend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

@Service
public class FileService {

    private final String uploadDir = System.getProperty("user.dir") + File.separator + "uploads";

    public FileService() {
        try {
            Files.createDirectories(Paths.get(uploadDir));
        } catch (IOException e) {
            throw new RuntimeException("Не удалось создать директорию для загрузки файлов", e);
        }
    }

    public String save(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        try {
            Files.createDirectories(Paths.get(uploadDir));
            var fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            var targetFile = new File(uploadDir, fileName);
            file.transferTo(targetFile);
            System.out.println("Saving file to: " + targetFile.getAbsolutePath());
            return fileName;
        } catch (IOException e) {
            throw new RuntimeException("Ошибка при сохранении файла", e);
        }
    }

    public void delete(String fileName) {
        if (fileName == null || fileName.isEmpty()) {
            return;
        }
        try {
            var filePath = Paths.get(uploadDir, fileName);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Ошибка при удалении файла", e);
        }
    }

    public byte[] loadFileAsBytes(String fileName) {
        try {
            var filePath = Paths.get(uploadDir).resolve(fileName).normalize();
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Ошибка при загрузке файла", e);
        }
    }
}
