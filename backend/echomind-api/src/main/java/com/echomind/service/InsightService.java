package com.echomind.service;

import com.echomind.ai.AiProvider;
import com.echomind.dto.InsightDtos.InsightResponse;
import com.echomind.entity.AiInsight;
import com.echomind.entity.Conversation;
import com.echomind.entity.Message;
import com.echomind.repository.AiInsightRepository;
import com.echomind.repository.MessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class InsightService {
    private static final Set<String> STOP = Set.of("the", "and", "for", "that", "with", "this", "from", "have", "are",
            "was", "will", "your", "you", "our", "they", "what", "when", "which", "about", "into", "there", "would",
            "could", "should", "been", "also", "more", "than", "then", "just", "like", "some", "only", "very");
    private static final Pattern ACTION = Pattern.compile("\\b(should|need to|will|must|todo|action)\\b", Pattern.CASE_INSENSITIVE);

    private final AiInsightRepository insights;
    private final MessageRepository messages;
    private final ConversationService conversations;
    private final AiProvider ai;

    public InsightService(AiInsightRepository insights, MessageRepository messages,
                          ConversationService conversations, AiProvider ai) {
        this.insights = insights; this.messages = messages; this.conversations = conversations; this.ai = ai;
    }

    /** Returns the stored insight or generates (and stores) a new one. */
    @Transactional
    public InsightResponse get(Long userId, Long conversationId, boolean regenerate) {
        Conversation c = conversations.owned(userId, conversationId);
        if (!regenerate) {
            Optional<AiInsight> existing = insights.findFirstByConversationIdOrderByCreatedAtDesc(conversationId);
            if (existing.isPresent()) return toResponse(existing.get(), false);
        }
        List<Message> msgs = messages.findByConversationIdOrderByCreatedAtAscIdAsc(conversationId);
        String text = msgs.stream().map(m -> m.getSender() + ": " + m.getText()).collect(Collectors.joining("\n"));

        AiInsight i = new AiInsight();
        i.setConversation(c);
        i.setSummary(msgs.isEmpty() ? "No messages yet." : ai.summarize(text));
        i.setSentiment(sentiment(text));
        i.setKeywords(String.join(",", keywords(text, 6)));
        i.setActionItems(msgs.stream().flatMap(m -> Arrays.stream(m.getText().split("(?<=[.!?])\\s+")))
                .filter(s -> ACTION.matcher(s).find()).limit(5).collect(Collectors.joining("|")));
        insights.saveAndFlush(i);
        return toResponse(insights.findById(i.getId()).orElse(i), ai.isDemo());
    }

    static String sentiment(String text) {
        String t = text.toLowerCase(Locale.ROOT);
        int pos = count(t, "good", "great", "like", "love", "thanks", "helpful", "success");
        int neg = count(t, "slow", "blocked", "issue", "problem", "bad", "fail", "error");
        if (pos > 0 && neg > 0) return "Mixed";
        if (pos > neg) return "Positive";
        if (neg > pos) return "Negative";
        return "Neutral";
    }

    static List<String> keywords(String text, int n) {
        Map<String, Long> freq = Arrays.stream(text.toLowerCase(Locale.ROOT).split("[^a-z-]+"))
                .filter(w -> w.length() > 3 && !STOP.contains(w))
                .collect(Collectors.groupingBy(w -> w, Collectors.counting()));
        return freq.entrySet().stream().sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(n).map(Map.Entry::getKey).toList();
    }

    private static int count(String t, String... words) {
        int c = 0;
        for (String w : words) c += t.split("\\b" + w + "\\b", -1).length - 1;
        return c;
    }

    private InsightResponse toResponse(AiInsight i, boolean demo) {
        return new InsightResponse(i.getConversation().getId(), i.getSummary(), i.getSentiment(),
                split(i.getKeywords(), ","), split(i.getActionItems(), "\\|"), i.getCreatedAt(), demo);
    }

    private static List<String> split(String s, String sep) {
        return s == null || s.isBlank() ? List.of() : Arrays.stream(s.split(sep)).map(String::trim).filter(x -> !x.isEmpty()).toList();
    }
}
