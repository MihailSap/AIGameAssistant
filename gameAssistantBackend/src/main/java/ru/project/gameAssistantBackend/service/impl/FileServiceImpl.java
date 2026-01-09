package ru.project.gameAssistantBackend.service.impl;

import net.coobird.thumbnailator.Thumbnails;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import ru.project.gameAssistantBackend.service.FileServiceI;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class FileServiceImpl implements FileServiceI {

    public final String uploadDir = System.getProperty("user.dir") + File.separator + "uploads";

    private static final int MAX_WIDTH = 1200;

    private static final float IMAGE_QUALITY = 0.1f;

    public FileServiceImpl() {
        try {
            Files.createDirectories(Paths.get(uploadDir));
        } catch (IOException e) {
            throw new RuntimeException("Не удалось создать директорию для загрузки файлов", e);
        }
    }

    @Override
    public String save(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        try {
            Files.createDirectories(Paths.get(uploadDir));
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            if(fileName.endsWith(".png")){
                fileName = fileName.replace(".png", ".jpg");
            }
            File targetFile = new File(uploadDir, fileName);
            if (isImage(file)) {
                saveCompressedImage(file, targetFile);
            } else {
                file.transferTo(targetFile);
            }
            System.out.println("Saving file to: " + targetFile.getAbsolutePath());
            return fileName;
        } catch (IOException e) {
            throw new RuntimeException("Ошибка при сохранении файла", e);
        }
    }

    @Override
    public void delete(String fileName) {
        if (fileName == null || fileName.isEmpty()) {
            return;
        }
        try {
            Path filePath = Paths.get(uploadDir, fileName);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Ошибка при удалении файла", e);
        }
    }

    @Override
    public Resource getFileResource(String fileTitle) throws MalformedURLException {
        Path path = Paths.get(String.format("uploads/%s", fileTitle));
        return new UrlResource(path.toUri());
    }

    @Override
    public String extractTextFromMarkdown(String fileTitle) {
        String real = fileTitle.replace(".pdf", ".md");
        try {
            return Files.readString(Paths.get(uploadDir, real), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new RuntimeException("Ошибка чтения файла: " + real, e);
        }
    }

    private void saveCompressedImage(MultipartFile file, File targetFile) throws IOException {
        BufferedImage originalImage = ImageIO.read(file.getInputStream());
        Thumbnails.of(originalImage)
                .size(MAX_WIDTH, MAX_WIDTH)
                .outputFormat("jpg")
                .outputQuality(IMAGE_QUALITY)
                .toFile(targetFile);
    }

    private boolean isImage(MultipartFile file) {
        return file.getContentType() != null &&
                file.getContentType().startsWith("image/");
    }
}
