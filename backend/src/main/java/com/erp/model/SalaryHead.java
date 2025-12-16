package com.erp.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "salary_heads")
public class SalaryHead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, length = 20)
    private String headType; // EARNING, DEDUCTION

    @Column(nullable = false, length = 30)
    private String category; // BASIC, ALLOWANCE, BONUS, REIMBURSEMENT, PRE_TAX_DEDUCTION, POST_TAX_DEDUCTION, TAX, STATUTORY

    @Column(length = 20)
    private String calculationType; // FIXED, PERCENTAGE, FORMULA

    private BigDecimal defaultValue;

    private BigDecimal percentageOf;

    @Column(length = 50)
    private String basedOnHead; // Reference to another salary head for percentage calculations

    private Boolean isTaxable;

    private Boolean isStatutory;

    private Boolean affectsGrossPay;

    private Boolean isActive;

    private Integer displayOrder;

    @Column(length = 50)
    private String applicableTo; // ALL, SALARIED, HOURLY

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isActive == null) isActive = true;
        if (isTaxable == null) isTaxable = true;
        if (isStatutory == null) isStatutory = false;
        if (affectsGrossPay == null) affectsGrossPay = true;
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

    public String getHeadType() { return headType; }
    public void setHeadType(String headType) { this.headType = headType; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getCalculationType() { return calculationType; }
    public void setCalculationType(String calculationType) { this.calculationType = calculationType; }

    public BigDecimal getDefaultValue() { return defaultValue; }
    public void setDefaultValue(BigDecimal defaultValue) { this.defaultValue = defaultValue; }

    public BigDecimal getPercentageOf() { return percentageOf; }
    public void setPercentageOf(BigDecimal percentageOf) { this.percentageOf = percentageOf; }

    public String getBasedOnHead() { return basedOnHead; }
    public void setBasedOnHead(String basedOnHead) { this.basedOnHead = basedOnHead; }

    public Boolean getIsTaxable() { return isTaxable; }
    public void setIsTaxable(Boolean isTaxable) { this.isTaxable = isTaxable; }

    public Boolean getIsStatutory() { return isStatutory; }
    public void setIsStatutory(Boolean isStatutory) { this.isStatutory = isStatutory; }

    public Boolean getAffectsGrossPay() { return affectsGrossPay; }
    public void setAffectsGrossPay(Boolean affectsGrossPay) { this.affectsGrossPay = affectsGrossPay; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

    public String getApplicableTo() { return applicableTo; }
    public void setApplicableTo(String applicableTo) { this.applicableTo = applicableTo; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
