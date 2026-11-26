package com.echomind.controller;

import com.echomind.dto.InsightDtos.InsightResponse;
import com.echomind.security.AuthUser;
import com.echomind.service.InsightService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/insights")
@Tag(name = "Insights")
public class InsightController {
    private final InsightService insights;

    public InsightController(InsightService insights) { this.insights = insights; }

    @GetMapping("/{conversationId}")
    public InsightResponse get(@AuthenticationPrincipal AuthUser user, @PathVariable Long conversationId,
                               @RequestParam(defaultValue = "false") boolean regenerate) {
        return insights.get(user.id(), conversationId, regenerate);
    }
}
