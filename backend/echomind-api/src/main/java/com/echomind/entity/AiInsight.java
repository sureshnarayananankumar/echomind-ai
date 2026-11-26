package com.echomind.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

/** keywords are comma-separated; action_items are pipe-separated. */
@Entity
@Table(name = "ai_insights")
@Getter @Setter
public class AiInsight {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conversation_id")
    private Conversation conversation;
    @Column(columnDefinition = "TEXT")
    private String summary;
    private String sentiment;
    @Column(columnDefinition = "TEXT")
    private String keywords;
    @Column(name = "action_items", columnDefinition = "TEXT")
    private String actionItems;
    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;
}
