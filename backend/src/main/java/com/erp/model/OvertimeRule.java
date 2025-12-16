package com.erp.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "overtime_rules")
public class OvertimeRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 300)
    private String description;

    @Column(nullable = false, length = 30)
    private String ruleType; // WEEKDAY_OT, WEEKEND_OT, HOLIDAY_OT, NIGHT_SHIFT

    private BigDecimal multiplier; // 1.5, 2.0, etc.

    private BigDecimal minHoursThreshold; // Hours after which OT kicks in (e.g., 8 hours/day, 40 hours/week)

    @Column(length = 20)
    private String thresholdType; // DAILY, WEEKLY

    private BigDecimal maxOvertimeHours; // Cap on OT hours

    @Column(length = 20)
    private String maxOvertimePeriod; // DAILY, WEEKLY, MONTHLY

    private Boolean requiresApproval;

    private Boolean isActive;

    private Integer priority; // For rule precedence

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isActive == null) isActive = true;
        if (requiresApproval == null) requiresApproval = true;
        if (multiplier == null) multiplier = BigDecimal.valueOf(1.5);
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getRuleType() { return ruleType; }
    public void setRuleType(String ruleType) { this.ruleType = ruleType; }

    public BigDecimal getMultiplier() { return multiplier; }
    public void setMultiplier(BigDecimal multiplier) { this.multiplier = multiplier; }

    public BigDecimal getMinHoursThreshold() { return minHoursThreshold; }
    public void setMinHoursThreshold(BigDecimal minHoursThreshold) { this.minHoursThreshold = minHoursThreshold; }

    public String getThresholdType() { return thresholdType; }
    public void setThresholdType(String thresholdType) { this.thresholdType = thresholdType; }

    public BigDecimal getMaxOvertimeHours() { return maxOvertimeHours; }
    public void setMaxOvertimeHours(BigDecimal maxOvertimeHours) { this.maxOvertimeHours = maxOvertimeHours; }

    public String getMaxOvertimePeriod() { return maxOvertimePeriod; }
    public void setMaxOvertimePeriod(String maxOvertimePeriod) { this.maxOvertimePeriod = maxOvertimePeriod; }

    public Boolean getRequiresApproval() { return requiresApproval; }
    public void setRequiresApproval(Boolean requiresApproval) { this.requiresApproval = requiresApproval; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Integer getPriority() { return priority; }
    public void setPriority(Integer priority) { this.priority = priority; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
