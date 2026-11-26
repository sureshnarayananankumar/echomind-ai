package com.echomind.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity
@Table(name = "voice_recordings")
@Getter @Setter
public class VoiceRecording {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conversation_id")
    private Conversation conversation;
    @Column(name = "file_name")
    private String fileName;
    @Column(name = "file_path")
    private String filePath;
    @Column(name = "duration_seconds")
    private Integer durationSeconds;
    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;
}
