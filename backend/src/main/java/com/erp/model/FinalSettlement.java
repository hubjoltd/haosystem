package com.erp.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "final_settlements")
public class FinalSettlement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true)
    private String settlementNumber;
    
    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;
    
    private LocalDate lastWorkingDay;
    private LocalDate resignationDate;
    private String separationType;
    
    private BigDecimal basicSalaryDue;
    private BigDecimal allowancesDue;
    private BigDecimal bonusDue;
    private BigDecimal leaveEncashment;
    private Integer leaveBalanceDays;
    private BigDecimal gratuityAmount;
    private BigDecimal noticePayRecovery;
    private BigDecimal otherEarnings;
    
    private BigDecimal totalEarnings;
    
    private BigDecimal loanRecovery;
    private BigDecimal advanceRecovery;
    private BigDecimal assetRecovery;
    private BigDecimal taxDeduction;
    private BigDecimal otherDeductions;
    
    private BigDecimal totalDeductions;
    
    private BigDecimal netPayable;
    
    private String status;
    
    private String approvedBy;
    private LocalDateTime approvedAt;
    private String processedBy;
    private LocalDateTime processedAt;
    
    @Column(columnDefinition = "TEXT")
    private String remarks;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    
    public FinalSettlement() {}
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = "DRAFT";
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSettlementNumber() { return settlementNumber; }
    public void setSettlementNumber(String settlementNumber) { this.settlementNumber = settlementNumber; }
    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }
    public LocalDate getLastWorkingDay() { return lastWorkingDay; }
    public void setLastWorkingDay(LocalDate lastWorkingDay) { this.lastWorkingDay = lastWorkingDay; }
    public LocalDate getResignationDate() { return resignationDate; }
    public void setResignationDate(LocalDate resignationDate) { this.resignationDate = resignationDate; }
    public String getSeparationType() { return separationType; }
    public void setSeparationType(String separationType) { this.separationType = separationType; }
    public BigDecimal getBasicSalaryDue() { return basicSalaryDue; }
    public void setBasicSalaryDue(BigDecimal basicSalaryDue) { this.basicSalaryDue = basicSalaryDue; }
    public BigDecimal getAllowancesDue() { return allowancesDue; }
    public void setAllowancesDue(BigDecimal allowancesDue) { this.allowancesDue = allowancesDue; }
    public BigDecimal getBonusDue() { return bonusDue; }
    public void setBonusDue(BigDecimal bonusDue) { this.bonusDue = bonusDue; }
    public BigDecimal getLeaveEncashment() { return leaveEncashment; }
    public void setLeaveEncashment(BigDecimal leaveEncashment) { this.leaveEncashment = leaveEncashment; }
    public Integer getLeaveBalanceDays() { return leaveBalanceDays; }
    public void setLeaveBalanceDays(Integer leaveBalanceDays) { this.leaveBalanceDays = leaveBalanceDays; }
    public BigDecimal getGratuityAmount() { return gratuityAmount; }
    public void setGratuityAmount(BigDecimal gratuityAmount) { this.gratuityAmount = gratuityAmount; }
    public BigDecimal getNoticePayRecovery() { return noticePayRecovery; }
    public void setNoticePayRecovery(BigDecimal noticePayRecovery) { this.noticePayRecovery = noticePayRecovery; }
    public BigDecimal getOtherEarnings() { return otherEarnings; }
    public void setOtherEarnings(BigDecimal otherEarnings) { this.otherEarnings = otherEarnings; }
    public BigDecimal getTotalEarnings() { return totalEarnings; }
    public void setTotalEarnings(BigDecimal totalEarnings) { this.totalEarnings = totalEarnings; }
    public BigDecimal getLoanRecovery() { return loanRecovery; }
    public void setLoanRecovery(BigDecimal loanRecovery) { this.loanRecovery = loanRecovery; }
    public BigDecimal getAdvanceRecovery() { return advanceRecovery; }
    public void setAdvanceRecovery(BigDecimal advanceRecovery) { this.advanceRecovery = advanceRecovery; }
    public BigDecimal getAssetRecovery() { return assetRecovery; }
    public void setAssetRecovery(BigDecimal assetRecovery) { this.assetRecovery = assetRecovery; }
    public BigDecimal getTaxDeduction() { return taxDeduction; }
    public void setTaxDeduction(BigDecimal taxDeduction) { this.taxDeduction = taxDeduction; }
    public BigDecimal getOtherDeductions() { return otherDeductions; }
    public void setOtherDeductions(BigDecimal otherDeductions) { this.otherDeductions = otherDeductions; }
    public BigDecimal getTotalDeductions() { return totalDeductions; }
    public void setTotalDeductions(BigDecimal totalDeductions) { this.totalDeductions = totalDeductions; }
    public BigDecimal getNetPayable() { return netPayable; }
    public void setNetPayable(BigDecimal netPayable) { this.netPayable = netPayable; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }
    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }
    public String getProcessedBy() { return processedBy; }
    public void setProcessedBy(String processedBy) { this.processedBy = processedBy; }
    public LocalDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
