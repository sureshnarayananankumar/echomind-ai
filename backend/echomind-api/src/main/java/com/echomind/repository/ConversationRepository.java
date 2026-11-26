package com.echomind.repository;

import com.echomind.entity.Conversation;
import com.echomind.entity.ConversationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    Optional<Conversation> findByIdAndUserId(Long id, Long userId);
    long countByUserId(Long userId);
    long countByUserIdAndType(Long userId, ConversationType type);

    @Query("""
        select c from Conversation c
        where c.user.id = :userId
          and (:type is null or c.type = :type)
          and (:q is null or lower(c.title) like lower(concat('%', :q, '%'))
               or exists (select m from Message m where m.conversation = c and lower(m.text) like lower(concat('%', :q, '%'))))
        order by c.updatedAt desc
        """)
    Page<Conversation> search(@Param("userId") Long userId, @Param("type") ConversationType type,
                              @Param("q") String q, Pageable pageable);
}
