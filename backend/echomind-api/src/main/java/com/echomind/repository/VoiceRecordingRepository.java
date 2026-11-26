package com.echomind.repository;

import com.echomind.entity.VoiceRecording;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface VoiceRecordingRepository extends JpaRepository<VoiceRecording, Long> {
    @Query("select coalesce(sum(v.durationSeconds), 0) from VoiceRecording v where v.conversation.user.id = :userId")
    long totalSecondsForUser(Long userId);
}
