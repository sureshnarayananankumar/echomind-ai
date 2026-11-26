package com.echomind.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public final class InsightDtos {
    private InsightDtos() {}

    public record InsightResponse(Long conversationId, String summary, String sentiment, List<String> keywords,
                                  List<String> actionItems, Instant createdAt, boolean demoMode) {}

    public record DashboardSummary(long totalConversations, long chatSessions, long voiceSessions,
                                   long documentSessions, long documentsProcessed, long minutesTranscribed,
                                   List<Map<String, Object>> last7Days) {}

    public record UsageEntry(String feature, int units, Instant at) {}
}
