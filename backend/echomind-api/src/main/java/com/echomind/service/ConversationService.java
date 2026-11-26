package com.echomind.service;

import com.echomind.ai.AiProvider;
import com.echomind.ai.AiProvider.ChatTurn;
import com.echomind.dto.ConversationDtos.*;
import com.echomind.entity.*;
import com.echomind.repository.ConversationRepository;
import com.echomind.repository.MessageRepository;
import com.echomind.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ConversationService {
    private static final int CONTEXT_MESSAGES = 12;

    private final ConversationRepository conversations;
    private final MessageRepository messages;
    private final UserRepository users;
    private final AiProvider ai;
    private final UsageService usage;

    public ConversationService(ConversationRepository conversations, MessageRepository messages,
                               UserRepository users, AiProvider ai, UsageService usage) {
        this.conversations = conversations; this.messages = messages; this.users = users; this.ai = ai; this.usage = usage;
    }

    @Transactional(readOnly = true)
    public Page<ConversationResponse> list(Long userId, ConversationType type, String q, Pageable pageable) {
        String query = (q == null || q.isBlank()) ? null : q.trim();
        return conversations.search(userId, type, query, pageable).map(this::toResponse);
    }

    @Transactional
    public ConversationResponse create(Long userId, CreateConversationRequest req) {
        Conversation c = new Conversation();
        c.setUser(users.getReferenceById(userId));
        c.setTitle(req.title().trim());
        c.setType(req.type() == null ? ConversationType.CHAT : req.type());
        conversations.saveAndFlush(c);
        return toResponse(conversations.findById(c.getId()).orElseThrow());
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> messages(Long userId, Long conversationId) {
        owned(userId, conversationId);
        return messages.findByConversationIdOrderByCreatedAtAscIdAsc(conversationId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public ChatExchangeResponse send(Long userId, Long conversationId, SendMessageRequest req) {
        Conversation c = owned(userId, conversationId);
        List<Message> previous = messages.findByConversationIdOrderByCreatedAtAscIdAsc(conversationId);
        Message userMsg = save(c, Sender.USER, req.message().trim());
        MessageResponse assistant = null;
        if (req.generateReply() == null || req.generateReply()) {
            List<ChatTurn> history = previous.stream()
                    .skip(Math.max(0, previous.size() - CONTEXT_MESSAGES))
                    .map(m -> new ChatTurn(m.getSender() == Sender.USER ? "user" : "assistant", m.getText()))
                    .toList();
            assistant = toResponse(save(c, Sender.ASSISTANT, ai.chat(history, req.message())));
            usage.record(userId, c.getType().name());
        }
        return new ChatExchangeResponse(toResponse(userMsg), assistant, ai.isDemo());
    }

    @Transactional
    public void delete(Long userId, Long conversationId) {
        conversations.delete(owned(userId, conversationId));
    }

    public Conversation owned(Long userId, Long conversationId) {
        return conversations.findByIdAndUserId(conversationId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Conversation " + conversationId + " not found"));
    }

    private Message save(Conversation c, Sender sender, String text) {
        Message m = new Message();
        m.setConversation(c);
        m.setSender(sender);
        m.setText(text);
        return messages.saveAndFlush(m);
    }

    private ConversationResponse toResponse(Conversation c) {
        return new ConversationResponse(c.getId(), c.getTitle(), c.getType(), messages.countByConversationId(c.getId()),
                c.getCreatedAt(), c.getUpdatedAt());
    }

    private MessageResponse toResponse(Message m) {
        return new MessageResponse(m.getId(), m.getSender(), m.getText(), m.getCreatedAt());
    }
}
