package ru.project.gameAssistantBackend.service.impl;

import com.aspose.pdf.Document;
import com.aspose.pdf.SaveFormat;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import ru.project.gameAssistantBackend.service.FileServiceI;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
public class FileServiceImpl implements FileServiceI {

    private final String uploadDir = System.getProperty("user.dir") + File.separator + "uploads";

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
            var fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            var targetFile = new File(uploadDir, fileName);
            file.transferTo(targetFile);
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
            var filePath = Paths.get(uploadDir, fileName);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Ошибка при удалении файла", e);
        }
    }

    @Override
    public Resource getFileResource(String fileTitle) throws MalformedURLException {
        var path = Paths.get(String.format("uploads/%s", fileTitle));
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

    public void pdfToMd(String pdfPath){
        String resultPdfPath = uploadDir + File.separator + pdfPath;
        String docxPath = resultPdfPath.replace(".pdf", ".docx");
        String mdPath = resultPdfPath.replace(".pdf", ".md");

        pdfToDocx(resultPdfPath, docxPath);
        docxToMd(docxPath, mdPath);

        delete(new File(docxPath).getName());

        String asposeImagePath = resultPdfPath.replace(".pdf", ".001.png");
        delete(new File(asposeImagePath).getName());

        cleanMd(mdPath);
    }

    public void pdfToDocx(String pdfPath, String docxPath) {
        Document pdfDoc = new Document(pdfPath);
        pdfDoc.save(docxPath, SaveFormat.DocX);
    }

    public void docxToMd(String docxPath, String mdPath) {
        com.aspose.words.Document wordDoc = null;
        try {
            wordDoc = new com.aspose.words.Document(docxPath);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        try {
            wordDoc.save(mdPath, com.aspose.words.SaveFormat.MARKDOWN);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public void cleanMd(String mdPath) {
        Path path = Path.of(mdPath);

        List<String> lines = null;
        try {
            lines = Files.readAllLines(path);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        List<String> newLines = lines.size() > 3 ?
                lines.subList(8, lines.size()) :
                List.of();

        try {
            Files.write(path, newLines);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
