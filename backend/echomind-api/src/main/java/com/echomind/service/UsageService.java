package com.echomind.service;

import com.echomind.entity.UsageLog;
import com.echomind.repository.UsageLogRepository;
import org.springframework.stereotype.Service;

@Service
public class UsageService {
    private final UsageLogRepository repo;

    public UsageService(UsageLogRepository repo) { this.repo = repo; }

    public void record(Long userId, String feature) {
        UsageLog log = new UsageLog();
        log.setUserId(userId);
        log.setFeatureName(feature);
        log.setUnitsUsed(1);
        repo.save(log);
    }
}
