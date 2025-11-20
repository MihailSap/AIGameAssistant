package ru.project.gameAssistantBackend.service.impl;

import com.aspose.pdf.Document;
import com.aspose.pdf.SaveFormat;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@Service
public class Converter {

    private final FileServiceImpl fileService;

    @Autowired
    public Converter(FileServiceImpl fileService) {
        this.fileService = fileService;
    }

    @Async
    public void convertPdfToMdAsync(String pdfFileName) {
        pdfToMd(pdfFileName);
    }

    public void pdfToMd(String pdfPath){
        String resultPdfPath = fileService.uploadDir + File.separator + pdfPath;
        String docxPath = resultPdfPath.replace(".pdf", ".docx");
        String mdPath = resultPdfPath.replace(".pdf", ".md");

        pdfToDocx(resultPdfPath, docxPath);
        docxToMd(docxPath, mdPath);

        fileService.delete(new File(docxPath).getName());

        String asposeImagePath = resultPdfPath.replace(".pdf", ".001.png");
        fileService.delete(new File(asposeImagePath).getName());

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
