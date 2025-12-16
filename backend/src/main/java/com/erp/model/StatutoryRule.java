package com.erp.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "statutory_rules")
public class StatutoryRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, length = 50)
    private String ruleType; // SOCIAL_SECURITY, MEDICARE, FUTA, SUTA, WORKERS_COMP, DISABILITY

    private BigDecimal employeeRate;

    private BigDecimal employerRate;

    private BigDecimal wageBase; // Annual wage limit

    private BigDecimal minWage;

    private BigDecimal maxContribution;

    @Column(length = 50)
    private String stateCode; // For state-specific rules

    private LocalDate effectiveFrom;

    private LocalDate effectiveTo;

    private Integer applicableYear;

    @Column(length = 20)
    private String frequency; // PER_PAYCHECK, ANNUAL

    private Boolean isMandatory;

    private Boolean isActive;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isActive == null) isActive = true;
        if (isMandatory == null) isMandatory = true;
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

    public BigDecimal getEmployeeRate() { return employeeRate; }
    public void setEmployeeRate(BigDecimal employeeRate) { this.employeeRate = employeeRate; }

    public BigDecimal getEmployerRate() { return employerRate; }
    public void setEmployerRate(BigDecimal employerRate) { this.employerRate = employerRate; }

    public BigDecimal getWageBase() { return wageBase; }
    public void setWageBase(BigDecimal wageBase) { this.wageBase = wageBase; }

    public BigDecimal getMinWage() { return minWage; }
    public void setMinWage(BigDecimal minWage) { this.minWage = minWage; }

    public BigDecimal getMaxContribution() { return maxContribution; }
    public void setMaxContribution(BigDecimal maxContribution) { this.maxContribution = maxContribution; }

    public String getStateCode() { return stateCode; }
    public void setStateCode(String stateCode) { this.stateCode = stateCode; }

    public LocalDate getEffectiveFrom() { return effectiveFrom; }
    public void setEffectiveFrom(LocalDate effectiveFrom) { this.effectiveFrom = effectiveFrom; }

    public LocalDate getEffectiveTo() { return effectiveTo; }
    public void setEffectiveTo(LocalDate effectiveTo) { this.effectiveTo = effectiveTo; }

    public Integer getApplicableYear() { return applicableYear; }
    public void setApplicableYear(Integer applicableYear) { this.applicableYear = applicableYear; }

    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }

    public Boolean getIsMandatory() { return isMandatory; }
    public void setIsMandatory(Boolean isMandatory) { this.isMandatory = isMandatory; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
