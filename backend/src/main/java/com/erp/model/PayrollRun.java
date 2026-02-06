package com.erp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payroll_runs")
public class PayrollRun {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String payrollRunNumber;

    @Column(length = 100)
    private String description;

    @ManyToOne
    @JoinColumn(name = "pay_frequency_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private PayFrequency payFrequency;

    @Column(nullable = false)
    private LocalDate periodStartDate;

    @Column(nullable = false)
    private LocalDate periodEndDate;

    @Column(nullable = false)
    private LocalDate payDate;

    private Integer totalEmployees;

    private BigDecimal totalGrossPay;

    private BigDecimal totalDeductions;

    private BigDecimal totalTaxes;

    private BigDecimal totalNetPay;

    private BigDecimal totalEmployerContributions;

    @Column(nullable = false, length = 20)
    private String status; // DRAFT, CALCULATING, CALCULATED, PENDING_APPROVAL, APPROVED, PROCESSED, CANCELLED

    @ManyToOne
    @JoinColumn(name = "created_by")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "department", "designation", "grade", "location", "branch", "costCenter", "expenseCenter", "jobRole", "reportingManager", "createdBy"})
    private Employee createdBy;

    @ManyToOne
    @JoinColumn(name = "approved_by")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "department", "designation", "grade", "location", "branch", "costCenter", "expenseCenter", "jobRole", "reportingManager", "createdBy"})
    private Employee approvedBy;

    private LocalDateTime approvedAt;

    @ManyToOne
    @JoinColumn(name = "processed_by")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "department", "designation", "grade", "location", "branch", "costCenter", "expenseCenter", "jobRole", "reportingManager", "createdBy"})
    private Employee processedBy;

    private LocalDateTime processedAt;

    @Column(length = 500)
    private String remarks;

    private Boolean isPostedToAccounts;

    private LocalDateTime postedAt;

    @Transient
    private Integer processedCount;

    @Transient
    private BigDecimal processedGrossPay;

    @Transient
    private BigDecimal processedTaxes;

    @Transient
    private BigDecimal processedNetPay;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = "DRAFT";
        if (isPostedToAccounts == null) isPostedToAccounts = false;
        if (totalGrossPay == null) totalGrossPay = BigDecimal.ZERO;
        if (totalDeductions == null) totalDeductions = BigDecimal.ZERO;
        if (totalTaxes == null) totalTaxes = BigDecimal.ZERO;
        if (totalNetPay == null) totalNetPay = BigDecimal.ZERO;
        if (totalEmployerContributions == null) totalEmployerContributions = BigDecimal.ZERO;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPayrollRunNumber() { return payrollRunNumber; }
    public void setPayrollRunNumber(String payrollRunNumber) { this.payrollRunNumber = payrollRunNumber; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public PayFrequency getPayFrequency() { return payFrequency; }
    public void setPayFrequency(PayFrequency payFrequency) { this.payFrequency = payFrequency; }

    public LocalDate getPeriodStartDate() { return periodStartDate; }
    public void setPeriodStartDate(LocalDate periodStartDate) { this.periodStartDate = periodStartDate; }

    public LocalDate getPeriodEndDate() { return periodEndDate; }
    public void setPeriodEndDate(LocalDate periodEndDate) { this.periodEndDate = periodEndDate; }

    public LocalDate getPayDate() { return payDate; }
    public void setPayDate(LocalDate payDate) { this.payDate = payDate; }

    public Integer getTotalEmployees() { return totalEmployees; }
    public void setTotalEmployees(Integer totalEmployees) { this.totalEmployees = totalEmployees; }

    public BigDecimal getTotalGrossPay() { return totalGrossPay; }
    public void setTotalGrossPay(BigDecimal totalGrossPay) { this.totalGrossPay = totalGrossPay; }

    public BigDecimal getTotalDeductions() { return totalDeductions; }
    public void setTotalDeductions(BigDecimal totalDeductions) { this.totalDeductions = totalDeductions; }

    public BigDecimal getTotalTaxes() { return totalTaxes; }
    public void setTotalTaxes(BigDecimal totalTaxes) { this.totalTaxes = totalTaxes; }

    public BigDecimal getTotalNetPay() { return totalNetPay; }
    public void setTotalNetPay(BigDecimal totalNetPay) { this.totalNetPay = totalNetPay; }

    public BigDecimal getTotalEmployerContributions() { return totalEmployerContributions; }
    public void setTotalEmployerContributions(BigDecimal totalEmployerContributions) { this.totalEmployerContributions = totalEmployerContributions; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Employee getCreatedBy() { return createdBy; }
    public void setCreatedBy(Employee createdBy) { this.createdBy = createdBy; }

    public Employee getApprovedBy() { return approvedBy; }
    public void setApprovedBy(Employee approvedBy) { this.approvedBy = approvedBy; }

    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }

    public Employee getProcessedBy() { return processedBy; }
    public void setProcessedBy(Employee processedBy) { this.processedBy = processedBy; }

    public LocalDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public Boolean getIsPostedToAccounts() { return isPostedToAccounts; }
    public void setIsPostedToAccounts(Boolean isPostedToAccounts) { this.isPostedToAccounts = isPostedToAccounts; }

    public LocalDateTime getPostedAt() { return postedAt; }
    public void setPostedAt(LocalDateTime postedAt) { this.postedAt = postedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Integer getProcessedCount() { return processedCount; }
    public void setProcessedCount(Integer processedCount) { this.processedCount = processedCount; }

    public BigDecimal getProcessedGrossPay() { return processedGrossPay; }
    public void setProcessedGrossPay(BigDecimal processedGrossPay) { this.processedGrossPay = processedGrossPay; }

    public BigDecimal getProcessedTaxes() { return processedTaxes; }
    public void setProcessedTaxes(BigDecimal processedTaxes) { this.processedTaxes = processedTaxes; }

    public BigDecimal getProcessedNetPay() { return processedNetPay; }
    public void setProcessedNetPay(BigDecimal processedNetPay) { this.processedNetPay = processedNetPay; }
}
