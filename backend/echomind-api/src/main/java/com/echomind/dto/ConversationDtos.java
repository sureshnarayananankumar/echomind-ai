package com.echomind.dto;

import com.echomind.entity.ConversationType;
import com.echomind.entity.Sender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;

public final class ConversationDtos {
    private ConversationDtos() {}

    public record CreateConversationRequest(@NotBlank @Size(max = 255) String title, ConversationType type) {}

    public record ConversationResponse(Long id, String title, ConversationType type, long messageCount,
                                       Instant createdAt, Instant updatedAt) {}

    public record SendMessageRequest(@NotBlank @Size(max = 8000) String message, Boolean generateReply) {}

    public record MessageResponse(Long id, Sender sender, String message, Instant createdAt) {}

    public record ChatExchangeResponse(MessageResponse userMessage, MessageResponse assistantMessage, boolean demoMode) {}

    public record ChatRequest(@NotBlank @Size(max = 8000) String prompt, List<MessageResponse> history) {}

    public record ChatResponse(String reply, String provider, boolean demoMode) {}
}
