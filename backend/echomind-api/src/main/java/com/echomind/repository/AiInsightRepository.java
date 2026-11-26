package com.echomind.repository;

import com.echomind.entity.AiInsight;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AiInsightRepository extends JpaRepository<AiInsight, Long> {
    Optional<AiInsight> findFirstByConversationIdOrderByCreatedAtDesc(Long conversationId);
}
