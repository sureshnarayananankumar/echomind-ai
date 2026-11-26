package com.echomind.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity
@Table(name = "usage_logs")
@Getter @Setter
public class UsageLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id", nullable = false)
    private Long userId;
    @Column(name = "feature_name", nullable = false, length = 80)
    private String featureName;
    @Column(name = "units_used")
    private Integer unitsUsed = 1;
    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;
}
