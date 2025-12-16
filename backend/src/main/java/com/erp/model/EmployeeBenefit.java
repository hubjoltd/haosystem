package com.erp.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee_benefits")
public class EmployeeBenefit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false, length = 50)
    private String benefitType; // HEALTH, DENTAL, VISION, LIFE, DISABILITY, 401K, HSA, FSA

    @Column(length = 100)
    private String planName;

    @Column(length = 50)
    private String coverageLevel; // EMPLOYEE_ONLY, EMPLOYEE_SPOUSE, EMPLOYEE_CHILDREN, FAMILY

    private BigDecimal employeeContribution; // Per pay period

    private BigDecimal employerContribution; // Per pay period

    private BigDecimal annualEmployeeContribution;

    private BigDecimal annualEmployerContribution;

    @Column(length = 20)
    private String contributionType; // FIXED, PERCENTAGE

    private BigDecimal contributionPercentage;

    private BigDecimal employerMatchPercentage; // For 401k

    private BigDecimal employerMatchLimit; // Max employer match

    private LocalDate enrollmentDate;

    private LocalDate effectiveDate;

    private LocalDate terminationDate;

    private Boolean isPreTax;

    private Boolean isActive;

    @Column(length = 500)
    private String notes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isActive == null) isActive = true;
        if (isPreTax == null) isPreTax = true;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }

    public String getBenefitType() { return benefitType; }
    public void setBenefitType(String benefitType) { this.benefitType = benefitType; }

    public String getPlanName() { return planName; }
    public void setPlanName(String planName) { this.planName = planName; }

    public String getCoverageLevel() { return coverageLevel; }
    public void setCoverageLevel(String coverageLevel) { this.coverageLevel = coverageLevel; }

    public BigDecimal getEmployeeContribution() { return employeeContribution; }
    public void setEmployeeContribution(BigDecimal employeeContribution) { this.employeeContribution = employeeContribution; }

    public BigDecimal getEmployerContribution() { return employerContribution; }
    public void setEmployerContribution(BigDecimal employerContribution) { this.employerContribution = employerContribution; }

    public BigDecimal getAnnualEmployeeContribution() { return annualEmployeeContribution; }
    public void setAnnualEmployeeContribution(BigDecimal annualEmployeeContribution) { this.annualEmployeeContribution = annualEmployeeContribution; }

    public BigDecimal getAnnualEmployerContribution() { return annualEmployerContribution; }
    public void setAnnualEmployerContribution(BigDecimal annualEmployerContribution) { this.annualEmployerContribution = annualEmployerContribution; }

    public String getContributionType() { return contributionType; }
    public void setContributionType(String contributionType) { this.contributionType = contributionType; }

    public BigDecimal getContributionPercentage() { return contributionPercentage; }
    public void setContributionPercentage(BigDecimal contributionPercentage) { this.contributionPercentage = contributionPercentage; }

    public BigDecimal getEmployerMatchPercentage() { return employerMatchPercentage; }
    public void setEmployerMatchPercentage(BigDecimal employerMatchPercentage) { this.employerMatchPercentage = employerMatchPercentage; }

    public BigDecimal getEmployerMatchLimit() { return employerMatchLimit; }
    public void setEmployerMatchLimit(BigDecimal employerMatchLimit) { this.employerMatchLimit = employerMatchLimit; }

    public LocalDate getEnrollmentDate() { return enrollmentDate; }
    public void setEnrollmentDate(LocalDate enrollmentDate) { this.enrollmentDate = enrollmentDate; }

    public LocalDate getEffectiveDate() { return effectiveDate; }
    public void setEffectiveDate(LocalDate effectiveDate) { this.effectiveDate = effectiveDate; }

    public LocalDate getTerminationDate() { return terminationDate; }
    public void setTerminationDate(LocalDate terminationDate) { this.terminationDate = terminationDate; }

    public Boolean getIsPreTax() { return isPreTax; }
    public void setIsPreTax(Boolean isPreTax) { this.isPreTax = isPreTax; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
