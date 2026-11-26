package com.echomind.repository;

import com.echomind.entity.UsageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant;
import java.util.List;

public interface UsageLogRepository extends JpaRepository<UsageLog, Long> {
    List<UsageLog> findByUserIdAndCreatedAtAfterOrderByCreatedAtAsc(Long userId, Instant after);
}
