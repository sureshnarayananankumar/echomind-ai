package com.echomind.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity
@Table(name = "transcripts")
@Getter @Setter
public class Transcript {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recording_id")
    private VoiceRecording recording;
    @Column(name = "transcript_text", nullable = false, columnDefinition = "LONGTEXT")
    private String text;
    @Column(name = "language_code")
    private String languageCode;
    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;
}
