package com.echomind.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity
@Table(name = "messages")
@Getter @Setter
public class Message {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conversation_id")
    private Conversation conversation;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Sender sender;
    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String text;
    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;
}
