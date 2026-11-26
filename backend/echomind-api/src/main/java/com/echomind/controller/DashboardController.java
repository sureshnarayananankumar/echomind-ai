package com.echomind.controller;

import com.echomind.dto.InsightDtos.DashboardSummary;
import com.echomind.dto.InsightDtos.UsageEntry;
import com.echomind.security.AuthUser;
import com.echomind.service.DashboardService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Dashboard & Usage")
public class DashboardController {
    private final DashboardService dashboard;

    public DashboardController(DashboardService dashboard) { this.dashboard = dashboard; }

    @GetMapping("/dashboard/summary")
    public DashboardSummary summary(@AuthenticationPrincipal AuthUser user) { return dashboard.summary(user.id()); }

    @GetMapping("/usage")
    public List<UsageEntry> usage(@AuthenticationPrincipal AuthUser user, @RequestParam(defaultValue = "30") int days) {
        return dashboard.history(user.id(), Math.min(days, 365));
    }
}
