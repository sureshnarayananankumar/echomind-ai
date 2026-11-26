package com.echomind.controller;

import com.echomind.dto.ConversationDtos.*;
import com.echomind.entity.ConversationType;
import com.echomind.security.AuthUser;
import com.echomind.service.ConversationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
@Tag(name = "Conversations")
public class ConversationController {
    private final ConversationService service;

    public ConversationController(ConversationService service) { this.service = service; }

    @GetMapping
    public Page<ConversationResponse> list(@AuthenticationPrincipal AuthUser user,
                                           @RequestParam(required = false) ConversationType type,
                                           @RequestParam(required = false) String q,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "20") int size) {
        return service.list(user.id(), type, q, PageRequest.of(page, Math.min(size, 100)));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ConversationResponse create(@AuthenticationPrincipal AuthUser user, @Valid @RequestBody CreateConversationRequest req) {
        return service.create(user.id(), req);
    }

    @GetMapping("/{id}/messages")
    public List<MessageResponse> messages(@AuthenticationPrincipal AuthUser user, @PathVariable Long id) {
        return service.messages(user.id(), id);
    }

    @PostMapping("/{id}/messages")
    public ChatExchangeResponse send(@AuthenticationPrincipal AuthUser user, @PathVariable Long id,
                                     @Valid @RequestBody SendMessageRequest req) {
        return service.send(user.id(), id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal AuthUser user, @PathVariable Long id) {
        service.delete(user.id(), id);
    }
}
