package com.echomind.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "user_settings")
@Getter @Setter
public class UserSettings {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;
    @Column(name = "preferred_language")
    private String preferredLanguage = "en";
    @Column(name = "preferred_voice")
    private String preferredVoice;
    @Column(name = "speech_enabled")
    private Boolean speechEnabled = true;
}
