package com.erp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "leave_types")
public class LeaveType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

    private BigDecimal annualEntitlement;

    @Column(length = 20)
    private String accrualType; // MONTHLY, ANNUALLY, NONE

    private BigDecimal accrualRate;

    private Boolean carryForwardAllowed;
    private BigDecimal maxCarryForward;

    private Boolean encashmentAllowed;
    private BigDecimal encashmentRate;

    private Boolean requiresApproval;
    private Integer minNoticeDays;
    private Integer maxConsecutiveDays;

    private Boolean isPaid;
    private Boolean isActive;

    private Boolean documentRequired;

    @Column(length = 50)
    private String applicableGender; // ALL, MALE, FEMALE

    private String colorCode;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isActive == null) isActive = true;
        if (isPaid == null) isPaid = true;
        if (requiresApproval == null) requiresApproval = true;
        if (applicableGender == null) applicableGender = "ALL";
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

    public BigDecimal getAnnualEntitlement() { return annualEntitlement; }
    public void setAnnualEntitlement(BigDecimal annualEntitlement) { this.annualEntitlement = annualEntitlement; }

    public String getAccrualType() { return accrualType; }
    public void setAccrualType(String accrualType) { this.accrualType = accrualType; }

    public BigDecimal getAccrualRate() { return accrualRate; }
    public void setAccrualRate(BigDecimal accrualRate) { this.accrualRate = accrualRate; }

    public Boolean getCarryForwardAllowed() { return carryForwardAllowed; }
    public void setCarryForwardAllowed(Boolean carryForwardAllowed) { this.carryForwardAllowed = carryForwardAllowed; }

    public BigDecimal getMaxCarryForward() { return maxCarryForward; }
    public void setMaxCarryForward(BigDecimal maxCarryForward) { this.maxCarryForward = maxCarryForward; }

    public Boolean getEncashmentAllowed() { return encashmentAllowed; }
    public void setEncashmentAllowed(Boolean encashmentAllowed) { this.encashmentAllowed = encashmentAllowed; }

    public BigDecimal getEncashmentRate() { return encashmentRate; }
    public void setEncashmentRate(BigDecimal encashmentRate) { this.encashmentRate = encashmentRate; }

    public Boolean getRequiresApproval() { return requiresApproval; }
    public void setRequiresApproval(Boolean requiresApproval) { this.requiresApproval = requiresApproval; }

    public Integer getMinNoticeDays() { return minNoticeDays; }
    public void setMinNoticeDays(Integer minNoticeDays) { this.minNoticeDays = minNoticeDays; }

    public Integer getMaxConsecutiveDays() { return maxConsecutiveDays; }
    public void setMaxConsecutiveDays(Integer maxConsecutiveDays) { this.maxConsecutiveDays = maxConsecutiveDays; }

    public Boolean getIsPaid() { return isPaid; }
    public void setIsPaid(Boolean isPaid) { this.isPaid = isPaid; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Boolean getDocumentRequired() { return documentRequired; }
    public void setDocumentRequired(Boolean documentRequired) { this.documentRequired = documentRequired; }

    public String getApplicableGender() { return applicableGender; }
    public void setApplicableGender(String applicableGender) { this.applicableGender = applicableGender; }

    public String getColorCode() { return colorCode; }
    public void setColorCode(String colorCode) { this.colorCode = colorCode; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
