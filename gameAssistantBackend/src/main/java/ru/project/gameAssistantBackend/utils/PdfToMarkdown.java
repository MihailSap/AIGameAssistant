package ru.project.gameAssistantBackend.utils;

import org.springframework.stereotype.Component;

@Component
public class PdfToMarkdown {

    public String convertTextToMarkdown(String text) {
        StringBuilder markdown = new StringBuilder();
        String[] lines = text.split("\n");
        for (int i = 0; i < lines.length; i++) {
            String currentLine = lines[i].trim();
            if (currentLine.isEmpty()) {
                markdown.append("\n");
                continue;
            }

            if (currentLine.startsWith("• ") || currentLine.startsWith("- ") || currentLine.startsWith("* ")) {
                markdown.append("* ")
                        .append(currentLine.substring(2).trim())
                        .append("\n");
                continue;
            }

            if (isHeading(currentLine, i, lines)) {
                markdown.append("## ");
            }

            markdown.append(currentLine)
                    .append("\n\n");
        }

        return markdown.toString().trim();
    }

    private boolean isHeading(String line, int index, String[] lines) {
        boolean nextEmpty = (index + 1 < lines.length && lines[index + 1].trim().isEmpty());
        return line.length() < 80 &&
                !line.endsWith(".") &&
                Character.isUpperCase(line.charAt(0)) &&
                nextEmpty;
    }
}

