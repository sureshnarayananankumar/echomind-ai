package com.echomind.controller;

import com.echomind.dto.DocumentDtos.SpeechRequest;
import com.echomind.dto.DocumentDtos.TranscribeResponse;
import com.echomind.security.AuthUser;
import com.echomind.service.VoiceService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/voice")
@Tag(name = "Voice")
public class VoiceController {
    private final VoiceService voice;

    public VoiceController(VoiceService voice) { this.voice = voice; }

    @PostMapping(value = "/transcribe", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public TranscribeResponse transcribe(@AuthenticationPrincipal AuthUser user,
                                         @RequestPart(value = "audio", required = false) MultipartFile audio,
                                         @RequestParam(value = "transcript", required = false) String transcript,
                                         @RequestParam(value = "languageCode", defaultValue = "en-US") String languageCode,
                                         @RequestParam(value = "durationSeconds", required = false) Integer duration) throws IOException {
        return voice.transcribe(user.id(), audio, transcript, languageCode, duration);
    }

    /**
     * Server-side text-to-speech placeholder. The Angular client uses the browser's speechSynthesis;
     * plug a TTS provider in here to return audio bytes for consistent production voices.
     */
    @PostMapping("/speech")
    public ResponseEntity<Map<String, Object>> speech(@Valid @RequestBody SpeechRequest req) {
        return ResponseEntity.status(501).body(Map.of(
                "message", "Server-side TTS provider not configured. Use browser speechSynthesis in Demo Mode.",
                "text", req.text(), "demoMode", true));
    }
}
