package com.echomind.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "document_chunks")
@Getter @Setter
public class DocumentChunk {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "document_id")
    private Document document;
    @Column(name = "chunk_number", nullable = false)
    private Integer chunkNumber;
    @Column(name = "chunk_text", nullable = false, columnDefinition = "TEXT")
    private String chunkText;
}
