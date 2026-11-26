package com.echomind.repository;

import com.echomind.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByConversationIdOrderByCreatedAtAscIdAsc(Long conversationId);
    long countByConversationId(Long conversationId);
}
