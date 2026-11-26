package com.echomind.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.List;

public final class DocumentDtos {
    private DocumentDtos() {}

    public record DocumentResponse(Long id, String fileName, String fileType, String status, int chunkCount, Instant createdAt) {}

    public record AskRequest(@NotBlank String question) {}

    public record AskResponse(String answer, List<String> sources, boolean demoMode) {}

    public record TranscribeResponse(Long recordingId, String transcript, String languageCode, boolean demoMode) {}

    public record SpeechRequest(@NotBlank String text, String voice, String languageCode) {}
}
