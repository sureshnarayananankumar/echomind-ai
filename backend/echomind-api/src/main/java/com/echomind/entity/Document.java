package com.echomind.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity
@Table(name = "documents")
@Getter @Setter
public class Document {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;
    @Column(name = "file_name", nullable = false)
    private String fileName;
    @Column(name = "file_type")
    private String fileType;
    @Column(name = "file_path")
    private String filePath;
    @Column(name = "processing_status")
    private String processingStatus = "PENDING";
    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;
}
