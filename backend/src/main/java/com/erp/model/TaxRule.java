package com.erp.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tax_rules")
public class TaxRule {

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
    private String taxType; // FEDERAL, STATE, LOCAL, SOCIAL_SECURITY, MEDICARE, DISABILITY

    @Column(length = 50)
    private String stateCode; // For state-specific taxes

    private BigDecimal rate; // Percentage rate

    private BigDecimal minIncome; // Minimum income threshold

    private BigDecimal maxIncome; // Maximum income cap (e.g., SS wage base)

    private BigDecimal fixedAmount; // Fixed amount if applicable

    @Column(length = 20)
    private String calculationBasis; // GROSS, TAXABLE_INCOME, FIXED

    private Boolean employeeContribution;

    private Boolean employerContribution;

    private BigDecimal employerRate; // Employer matching rate if different

    private LocalDate effectiveFrom;

    private LocalDate effectiveTo;

    private Integer taxYear;

    private Boolean isActive;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isActive == null) isActive = true;
        if (employeeContribution == null) employeeContribution = true;
        if (employerContribution == null) employerContribution = false;
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

    public String getTaxType() { return taxType; }
    public void setTaxType(String taxType) { this.taxType = taxType; }

    public String getStateCode() { return stateCode; }
    public void setStateCode(String stateCode) { this.stateCode = stateCode; }

    public BigDecimal getRate() { return rate; }
    public void setRate(BigDecimal rate) { this.rate = rate; }

    public BigDecimal getMinIncome() { return minIncome; }
    public void setMinIncome(BigDecimal minIncome) { this.minIncome = minIncome; }

    public BigDecimal getMaxIncome() { return maxIncome; }
    public void setMaxIncome(BigDecimal maxIncome) { this.maxIncome = maxIncome; }

    public BigDecimal getFixedAmount() { return fixedAmount; }
    public void setFixedAmount(BigDecimal fixedAmount) { this.fixedAmount = fixedAmount; }

    public String getCalculationBasis() { return calculationBasis; }
    public void setCalculationBasis(String calculationBasis) { this.calculationBasis = calculationBasis; }

    public Boolean getEmployeeContribution() { return employeeContribution; }
    public void setEmployeeContribution(Boolean employeeContribution) { this.employeeContribution = employeeContribution; }

    public Boolean getEmployerContribution() { return employerContribution; }
    public void setEmployerContribution(Boolean employerContribution) { this.employerContribution = employerContribution; }

    public BigDecimal getEmployerRate() { return employerRate; }
    public void setEmployerRate(BigDecimal employerRate) { this.employerRate = employerRate; }

    public LocalDate getEffectiveFrom() { return effectiveFrom; }
    public void setEffectiveFrom(LocalDate effectiveFrom) { this.effectiveFrom = effectiveFrom; }

    public LocalDate getEffectiveTo() { return effectiveTo; }
    public void setEffectiveTo(LocalDate effectiveTo) { this.effectiveTo = effectiveTo; }

    public Integer getTaxYear() { return taxYear; }
    public void setTaxYear(Integer taxYear) { this.taxYear = taxYear; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
