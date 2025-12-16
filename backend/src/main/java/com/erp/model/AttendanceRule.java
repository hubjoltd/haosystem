package com.erp.model;

import jakarta.persistence.*;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "attendance_rules")
public class AttendanceRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String ruleName;

    @Column(length = 500)
    private String description;

    private LocalTime standardStartTime;
    private LocalTime standardEndTime;

    private BigDecimal regularHoursPerDay;
    private BigDecimal weeklyHoursLimit;

    private Integer graceMinutesIn;
    private Integer graceMinutesOut;

    private BigDecimal breakDurationMinutes;
    private Boolean autoDeductBreak;

    private Boolean enableOvertime;
    private BigDecimal overtimeMultiplier;
    private BigDecimal maxOvertimeHoursDaily;
    private BigDecimal maxOvertimeHoursWeekly;

    private Boolean halfDayEnabled;
    private BigDecimal halfDayHours;

    private Boolean isActive;
    private Boolean isDefault;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isActive == null) isActive = true;
        if (isDefault == null) isDefault = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRuleName() { return ruleName; }
    public void setRuleName(String ruleName) { this.ruleName = ruleName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalTime getStandardStartTime() { return standardStartTime; }
    public void setStandardStartTime(LocalTime standardStartTime) { this.standardStartTime = standardStartTime; }

    public LocalTime getStandardEndTime() { return standardEndTime; }
    public void setStandardEndTime(LocalTime standardEndTime) { this.standardEndTime = standardEndTime; }

    public BigDecimal getRegularHoursPerDay() { return regularHoursPerDay; }
    public void setRegularHoursPerDay(BigDecimal regularHoursPerDay) { this.regularHoursPerDay = regularHoursPerDay; }

    public BigDecimal getWeeklyHoursLimit() { return weeklyHoursLimit; }
    public void setWeeklyHoursLimit(BigDecimal weeklyHoursLimit) { this.weeklyHoursLimit = weeklyHoursLimit; }

    public Integer getGraceMinutesIn() { return graceMinutesIn; }
    public void setGraceMinutesIn(Integer graceMinutesIn) { this.graceMinutesIn = graceMinutesIn; }

    public Integer getGraceMinutesOut() { return graceMinutesOut; }
    public void setGraceMinutesOut(Integer graceMinutesOut) { this.graceMinutesOut = graceMinutesOut; }

    public BigDecimal getBreakDurationMinutes() { return breakDurationMinutes; }
    public void setBreakDurationMinutes(BigDecimal breakDurationMinutes) { this.breakDurationMinutes = breakDurationMinutes; }

    public Boolean getAutoDeductBreak() { return autoDeductBreak; }
    public void setAutoDeductBreak(Boolean autoDeductBreak) { this.autoDeductBreak = autoDeductBreak; }

    public Boolean getEnableOvertime() { return enableOvertime; }
    public void setEnableOvertime(Boolean enableOvertime) { this.enableOvertime = enableOvertime; }

    public BigDecimal getOvertimeMultiplier() { return overtimeMultiplier; }
    public void setOvertimeMultiplier(BigDecimal overtimeMultiplier) { this.overtimeMultiplier = overtimeMultiplier; }

    public BigDecimal getMaxOvertimeHoursDaily() { return maxOvertimeHoursDaily; }
    public void setMaxOvertimeHoursDaily(BigDecimal maxOvertimeHoursDaily) { this.maxOvertimeHoursDaily = maxOvertimeHoursDaily; }

    public BigDecimal getMaxOvertimeHoursWeekly() { return maxOvertimeHoursWeekly; }
    public void setMaxOvertimeHoursWeekly(BigDecimal maxOvertimeHoursWeekly) { this.maxOvertimeHoursWeekly = maxOvertimeHoursWeekly; }

    public Boolean getHalfDayEnabled() { return halfDayEnabled; }
    public void setHalfDayEnabled(Boolean halfDayEnabled) { this.halfDayEnabled = halfDayEnabled; }

    public BigDecimal getHalfDayHours() { return halfDayHours; }
    public void setHalfDayHours(BigDecimal halfDayHours) { this.halfDayHours = halfDayHours; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Boolean getIsDefault() { return isDefault; }
    public void setIsDefault(Boolean isDefault) { this.isDefault = isDefault; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
