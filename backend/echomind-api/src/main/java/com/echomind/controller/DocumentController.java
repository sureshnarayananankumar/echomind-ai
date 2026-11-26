package com.echomind.controller;

import com.echomind.dto.DocumentDtos.*;
import com.echomind.security.AuthUser;
import com.echomind.service.DocumentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@Tag(name = "Documents")
public class DocumentController {
    private final DocumentService documents;

    public DocumentController(DocumentService documents) { this.documents = documents; }

    @GetMapping
    public List<DocumentResponse> list(@AuthenticationPrincipal AuthUser user) { return documents.list(user.id()); }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public DocumentResponse upload(@AuthenticationPrincipal AuthUser user, @RequestPart("file") MultipartFile file) throws IOException {
        return documents.upload(user.id(), file);
    }

    @PostMapping("/{id}/ask")
    public AskResponse ask(@AuthenticationPrincipal AuthUser user, @PathVariable Long id, @Valid @RequestBody AskRequest req) {
        return documents.ask(user.id(), id, req.question());
    }
}
