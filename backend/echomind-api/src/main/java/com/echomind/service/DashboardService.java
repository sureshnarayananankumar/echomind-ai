package com.echomind.service;

import com.echomind.dto.InsightDtos.DashboardSummary;
import com.echomind.dto.InsightDtos.UsageEntry;
import com.echomind.entity.ConversationType;
import com.echomind.entity.UsageLog;
import com.echomind.repository.ConversationRepository;
import com.echomind.repository.DocumentRepository;
import com.echomind.repository.UsageLogRepository;
import com.echomind.repository.VoiceRecordingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class DashboardService {
    private final ConversationRepository conversations;
    private final DocumentRepository documents;
    private final VoiceRecordingRepository recordings;
    private final UsageLogRepository usage;

    public DashboardService(ConversationRepository conversations, DocumentRepository documents,
                            VoiceRecordingRepository recordings, UsageLogRepository usage) {
        this.conversations = conversations; this.documents = documents; this.recordings = recordings; this.usage = usage;
    }

    @Transactional(readOnly = true)
    public DashboardSummary summary(Long userId) {
        Instant since = LocalDate.now(ZoneOffset.UTC).minusDays(6).atStartOfDay().toInstant(ZoneOffset.UTC);
        Map<LocalDate, Map<String, Object>> days = new LinkedHashMap<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = LocalDate.now(ZoneOffset.UTC).minusDays(i);
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("date", d.toString());
            row.put("CHAT", 0); row.put("VOICE", 0); row.put("DOCUMENT", 0);
            days.put(d, row);
        }
        for (UsageLog l : usage.findByUserIdAndCreatedAtAfterOrderByCreatedAtAsc(userId, since)) {
            Map<String, Object> row = days.get(l.getCreatedAt().atZone(ZoneOffset.UTC).toLocalDate());
            if (row != null && row.containsKey(l.getFeatureName())) {
                row.put(l.getFeatureName(), (Integer) row.get(l.getFeatureName()) + l.getUnitsUsed());
            }
        }
        return new DashboardSummary(
                conversations.countByUserId(userId),
                conversations.countByUserIdAndType(userId, ConversationType.CHAT),
                conversations.countByUserIdAndType(userId, ConversationType.VOICE),
                conversations.countByUserIdAndType(userId, ConversationType.DOCUMENT),
                documents.countByUserId(userId),
                recordings.totalSecondsForUser(userId) / 60,
                new ArrayList<>(days.values()));
    }

    @Transactional(readOnly = true)
    public List<UsageEntry> history(Long userId, int days) {
        return usage.findByUserIdAndCreatedAtAfterOrderByCreatedAtAsc(userId, Instant.now().minus(days, ChronoUnit.DAYS))
                .stream().map(l -> new UsageEntry(l.getFeatureName(), l.getUnitsUsed(), l.getCreatedAt())).toList();
    }
}
