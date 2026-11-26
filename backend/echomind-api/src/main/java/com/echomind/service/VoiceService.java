package com.echomind.service;

import com.echomind.ai.AiProvider;
import com.echomind.dto.DocumentDtos.TranscribeResponse;
import com.echomind.entity.Conversation;
import com.echomind.entity.ConversationType;
import com.echomind.entity.Transcript;
import com.echomind.entity.VoiceRecording;
import com.echomind.repository.ConversationRepository;
import com.echomind.repository.TranscriptRepository;
import com.echomind.repository.UserRepository;
import com.echomind.repository.VoiceRecordingRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;
import java.util.UUID;

/**
 * Stores uploaded audio + transcript metadata.
 * Transcription itself is a pluggable step: in Demo Mode the browser (Web Speech API) supplies the text,
 * or a placeholder is stored. Wire a speech-to-text provider into {@link #speechToText} for production.
 */
@Service
public class VoiceService {
    private final VoiceRecordingRepository recordings;
    private final TranscriptRepository transcripts;
    private final ConversationRepository conversations;
    private final UserRepository users;
    private final UsageService usage;
    private final AiProvider ai;
    private final Path uploadDir;

    public VoiceService(VoiceRecordingRepository recordings, TranscriptRepository transcripts,
                        ConversationRepository conversations, UserRepository users, UsageService usage, AiProvider ai,
                        @Value("${echomind.storage.upload-dir}") String uploadDir) {
        this.recordings = recordings; this.transcripts = transcripts; this.conversations = conversations;
        this.users = users; this.usage = usage; this.ai = ai; this.uploadDir = Path.of(uploadDir, "audio");
    }

    @Transactional
    public TranscribeResponse transcribe(Long userId, MultipartFile audio, String clientTranscript,
                                         String languageCode, Integer durationSeconds) throws IOException {
        Conversation c = new Conversation();
        c.setUser(users.getReferenceById(userId));
        c.setTitle("Voice session");
        c.setType(ConversationType.VOICE);
        conversations.save(c);

        VoiceRecording r = new VoiceRecording();
        r.setConversation(c);
        r.setDurationSeconds(durationSeconds);
        if (audio != null && !audio.isEmpty()) {
            Files.createDirectories(uploadDir);
            String name = Optional.ofNullable(audio.getOriginalFilename()).orElse("audio.webm").replaceAll("[^A-Za-z0-9._-]", "_");
            Path target = uploadDir.resolve(UUID.randomUUID() + "-" + name);
            audio.transferTo(target);
            r.setFileName(name);
            r.setFilePath(target.toString());
        }
        recordings.save(r);

        String text = (clientTranscript != null && !clientTranscript.isBlank())
                ? clientTranscript.trim() : speechToText(r);
        Transcript t = new Transcript();
        t.setRecording(r);
        t.setText(text);
        t.setLanguageCode(languageCode);
        transcripts.save(t);
        usage.record(userId, "VOICE");
        return new TranscribeResponse(r.getId(), text, languageCode, ai.isDemo());
    }

    /** Placeholder for a server-side speech-to-text provider. */
    protected String speechToText(VoiceRecording r) {
        return "[Demo] Server-side transcription is not configured. Audio stored as " + r.getFileName() + ".";
    }
}
