-- =====================================================================
-- EchoMind AI — MySQL 8 schema
-- Run:  mysql -u root -p < database/echomind_schema.sql
-- =====================================================================

CREATE DATABASE IF NOT EXISTS echomind_ai
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE echomind_ai;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS user_settings, usage_logs, document_chunks, documents,
  ai_insights, transcripts, voice_recordings, messages, conversations, users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
    id            BIGINT PRIMARY KEY AUTO_INCREMENT,
    username      VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conversations (
    id                BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id           BIGINT NOT NULL,
    title             VARCHAR(255) NOT NULL,
    conversation_type ENUM('CHAT', 'VOICE', 'DOCUMENT') NOT NULL DEFAULT 'CHAT',
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_conversation_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_conversation_user_updated (user_id, updated_at)
);

CREATE TABLE messages (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    conversation_id BIGINT NOT NULL,
    sender          ENUM('USER', 'ASSISTANT', 'SYSTEM') NOT NULL,
    message         TEXT NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_message_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    INDEX idx_message_conversation (conversation_id, created_at),
    FULLTEXT INDEX ft_message_text (message)
);

CREATE TABLE voice_recordings (
    id               BIGINT PRIMARY KEY AUTO_INCREMENT,
    conversation_id  BIGINT NOT NULL,
    file_name        VARCHAR(255),
    file_path        VARCHAR(500),
    duration_seconds INT,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_recording_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

CREATE TABLE transcripts (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    recording_id    BIGINT NOT NULL,
    transcript_text LONGTEXT NOT NULL,
    language_code   VARCHAR(20),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transcript_recording FOREIGN KEY (recording_id) REFERENCES voice_recordings(id) ON DELETE CASCADE,
    FULLTEXT INDEX ft_transcript_text (transcript_text)
);

CREATE TABLE ai_insights (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    conversation_id BIGINT NOT NULL,
    summary         TEXT,
    sentiment       VARCHAR(40),
    keywords        TEXT,
    action_items    TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_insight_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

CREATE TABLE documents (
    id                BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id           BIGINT NOT NULL,
    file_name         VARCHAR(255) NOT NULL,
    file_type         VARCHAR(100),
    file_path         VARCHAR(500),
    processing_status VARCHAR(40) DEFAULT 'PENDING',
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_document_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE document_chunks (
    id           BIGINT PRIMARY KEY AUTO_INCREMENT,
    document_id  BIGINT NOT NULL,
    chunk_number INT NOT NULL,
    chunk_text   TEXT NOT NULL,
    CONSTRAINT fk_chunk_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    UNIQUE KEY uk_chunk (document_id, chunk_number),
    FULLTEXT INDEX ft_chunk_text (chunk_text)
);

CREATE TABLE usage_logs (
    id           BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id      BIGINT NOT NULL,
    feature_name VARCHAR(80) NOT NULL,
    units_used   INT DEFAULT 1,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usage_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_usage_user_created (user_id, created_at)
);

CREATE TABLE user_settings (
    id                 BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id            BIGINT NOT NULL UNIQUE,
    preferred_language VARCHAR(20) DEFAULT 'en',
    preferred_voice    VARCHAR(100),
    speech_enabled     BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_settings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
