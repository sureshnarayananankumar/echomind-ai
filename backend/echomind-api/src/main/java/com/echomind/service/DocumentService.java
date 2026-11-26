package com.echomind.service;

import com.echomind.ai.AiProvider;
import com.echomind.dto.DocumentDtos.*;
import com.echomind.entity.Document;
import com.echomind.entity.DocumentChunk;
import com.echomind.repository.DocumentChunkRepository;
import com.echomind.repository.DocumentRepository;
import com.echomind.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

@Service
public class DocumentService {
    private static final int CHUNK_SIZE = 800;
    private static final int TOP_K = 3;

    private final DocumentRepository documents;
    private final DocumentChunkRepository chunks;
    private final UserRepository users;
    private final AiProvider ai;
    private final UsageService usage;
    private final Path uploadDir;

    public DocumentService(DocumentRepository documents, DocumentChunkRepository chunks, UserRepository users,
                           AiProvider ai, UsageService usage, @Value("${echomind.storage.upload-dir}") String uploadDir) {
        this.documents = documents; this.chunks = chunks; this.users = users; this.ai = ai; this.usage = usage;
        this.uploadDir = Path.of(uploadDir, "docs");
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> list(Long userId) {
        return documents.findByUserIdOrderByCreatedAtDesc(userId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public DocumentResponse upload(Long userId, MultipartFile file) throws IOException {
        String name = Optional.ofNullable(file.getOriginalFilename()).orElse("document").replaceAll("[^A-Za-z0-9._-]", "_");
        boolean pdf = name.toLowerCase(Locale.ROOT).endsWith(".pdf");
        if (!pdf && !name.toLowerCase(Locale.ROOT).endsWith(".txt")) {
            throw new IllegalArgumentException("Only PDF and TXT files are supported");
        }
        Files.createDirectories(uploadDir);
        Path target = uploadDir.resolve(UUID.randomUUID() + "-" + name);
        file.transferTo(target);

        Document d = new Document();
        d.setUser(users.getReferenceById(userId));
        d.setFileName(name);
        d.setFileType(pdf ? "application/pdf" : "text/plain");
        d.setFilePath(target.toString());
        documents.save(d);

        String text = pdf ? extractPdf(target) : Files.readString(target, StandardCharsets.UTF_8);
        List<String> parts = chunk(text);
        for (int i = 0; i < parts.size(); i++) {
            DocumentChunk c = new DocumentChunk();
            c.setDocument(d);
            c.setChunkNumber(i + 1);
            c.setChunkText(parts.get(i));
            chunks.save(c);
        }
        d.setProcessingStatus(parts.isEmpty() ? "FAILED" : "PROCESSED");
        usage.record(userId, "DOCUMENT");
        documents.flush();
        return toResponse(documents.findById(d.getId()).orElse(d));
    }

    /** Basic RAG: keyword-overlap retrieval over chunks, then the AI provider answers from the top passages. */
    @Transactional(readOnly = true)
    public AskResponse ask(Long userId, Long documentId, String question) {
        documents.findByIdAndUserId(documentId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Document " + documentId + " not found"));
        Set<String> terms = new HashSet<>(Arrays.asList(question.toLowerCase(Locale.ROOT).split("\\W+")));
        terms.removeIf(t -> t.length() < 4);
        List<String> top = chunks.findByDocumentIdOrderByChunkNumber(documentId).stream()
                .map(DocumentChunk::getChunkText)
                .map(t -> Map.entry(t, terms.stream().filter(t.toLowerCase(Locale.ROOT)::contains).count()))
                .filter(e -> e.getValue() > 0)
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(TOP_K).map(Map.Entry::getKey).toList();
        if (top.isEmpty()) {
            return new AskResponse("I could not find a relevant passage in this document.", List.of(), ai.isDemo());
        }
        usage.record(userId, "DOCUMENT_QA");
        return new AskResponse(ai.answerFromContext(question, top), top, ai.isDemo());
    }

    static List<String> chunk(String text) {
        List<String> out = new ArrayList<>();
        StringBuilder cur = new StringBuilder();
        for (String para : text.split("\\n\\s*\\n|(?<=[.!?])\\s+")) {
            String p = para.trim();
            if (p.isEmpty()) continue;
            if (cur.length() + p.length() > CHUNK_SIZE && !cur.isEmpty()) {
                out.add(cur.toString().trim());
                cur.setLength(0);
            }
            cur.append(p).append(' ');
        }
        if (!cur.isEmpty()) out.add(cur.toString().trim());
        return out;
    }

    private String extractPdf(Path path) throws IOException {
        try (PDDocument pdf = Loader.loadPDF(path.toFile())) {
            return new PDFTextStripper().getText(pdf);
        }
    }

    private DocumentResponse toResponse(Document d) {
        return new DocumentResponse(d.getId(), d.getFileName(), d.getFileType(), d.getProcessingStatus(),
                chunks.findByDocumentIdOrderByChunkNumber(d.getId()).size(), d.getCreatedAt());
    }
}
