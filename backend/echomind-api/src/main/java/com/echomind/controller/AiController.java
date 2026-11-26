package com.echomind.controller;

import com.echomind.ai.AiProvider;
import com.echomind.ai.AiProvider.ChatTurn;
import com.echomind.dto.ConversationDtos.ChatRequest;
import com.echomind.dto.ConversationDtos.ChatResponse;
import com.echomind.entity.Sender;
import com.echomind.security.AuthUser;
import com.echomind.service.UsageService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Stateless chat endpoint (no persistence). Use /api/conversations/{id}/messages to store history. */
@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI")
public class AiController {
    private final AiProvider ai;
    private final UsageService usage;

    public AiController(AiProvider ai, UsageService usage) { this.ai = ai; this.usage = usage; }

    @PostMapping("/chat")
    public ChatResponse chat(@AuthenticationPrincipal AuthUser user, @Valid @RequestBody ChatRequest req) {
        List<ChatTurn> history = req.history() == null ? List.of() : req.history().stream()
                .map(m -> new ChatTurn(m.sender() == Sender.USER ? "user" : "assistant", m.message())).toList();
        String reply = ai.chat(history, req.prompt());
        usage.record(user.id(), "CHAT");
        return new ChatResponse(reply, ai.name(), ai.isDemo());
    }
}
