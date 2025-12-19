package com.erp.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "loan_applications")
public class LoanApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 30)
    private String applicationNumber;
    
    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;
    
    @Column(nullable = false, length = 50)
    private String loanType;
    
    @Column(columnDefinition = "TEXT")
    private String purpose;
    
    @Column(nullable = false)
    private BigDecimal requestedAmount;
    
    private BigDecimal approvedAmount;
    
    private Integer requestedTenureMonths;
    private Integer approvedTenureMonths;
    
    private BigDecimal interestRate;
    
    @Column(length = 30)
    private String interestType;
    
    private BigDecimal emiAmount;
    
    private LocalDate requestedDisbursementDate;
    private LocalDate actualDisbursementDate;
    
    @Column(nullable = false, length = 30)
    private String status = "DRAFT";
    
    private LocalDateTime submittedAt;
    
    @ManyToOne
    @JoinColumn(name = "approved_by_id")
    private Employee approvedBy;
    
    private LocalDateTime approvedAt;
    
    @Column(columnDefinition = "TEXT")
    private String approverRemarks;
    
    private LocalDateTime rejectedAt;
    
    @Column(columnDefinition = "TEXT")
    private String rejectionReason;
    
    private BigDecimal totalRepayable;
    private BigDecimal totalInterest;
    private BigDecimal outstandingBalance;
    
    private Integer paidInstallments = 0;
    private Integer remainingInstallments;
    
    private LocalDate nextEmiDate;
    private LocalDate lastEmiDate;
    
    private Boolean fullyRepaid = false;
    private LocalDateTime repaidAt;
    
    private Boolean deductFromPayroll = true;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getApplicationNumber() { return applicationNumber; }
    public void setApplicationNumber(String applicationNumber) { this.applicationNumber = applicationNumber; }
    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }
    public String getLoanType() { return loanType; }
    public void setLoanType(String loanType) { this.loanType = loanType; }
    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }
    public BigDecimal getRequestedAmount() { return requestedAmount; }
    public void setRequestedAmount(BigDecimal requestedAmount) { this.requestedAmount = requestedAmount; }
    public BigDecimal getApprovedAmount() { return approvedAmount; }
    public void setApprovedAmount(BigDecimal approvedAmount) { this.approvedAmount = approvedAmount; }
    public Integer getRequestedTenureMonths() { return requestedTenureMonths; }
    public void setRequestedTenureMonths(Integer requestedTenureMonths) { this.requestedTenureMonths = requestedTenureMonths; }
    public Integer getApprovedTenureMonths() { return approvedTenureMonths; }
    public void setApprovedTenureMonths(Integer approvedTenureMonths) { this.approvedTenureMonths = approvedTenureMonths; }
    public BigDecimal getInterestRate() { return interestRate; }
    public void setInterestRate(BigDecimal interestRate) { this.interestRate = interestRate; }
    public String getInterestType() { return interestType; }
    public void setInterestType(String interestType) { this.interestType = interestType; }
    public BigDecimal getEmiAmount() { return emiAmount; }
    public void setEmiAmount(BigDecimal emiAmount) { this.emiAmount = emiAmount; }
    public LocalDate getRequestedDisbursementDate() { return requestedDisbursementDate; }
    public void setRequestedDisbursementDate(LocalDate requestedDisbursementDate) { this.requestedDisbursementDate = requestedDisbursementDate; }
    public LocalDate getActualDisbursementDate() { return actualDisbursementDate; }
    public void setActualDisbursementDate(LocalDate actualDisbursementDate) { this.actualDisbursementDate = actualDisbursementDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public Employee getApprovedBy() { return approvedBy; }
    public void setApprovedBy(Employee approvedBy) { this.approvedBy = approvedBy; }
    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }
    public String getApproverRemarks() { return approverRemarks; }
    public void setApproverRemarks(String approverRemarks) { this.approverRemarks = approverRemarks; }
    public LocalDateTime getRejectedAt() { return rejectedAt; }
    public void setRejectedAt(LocalDateTime rejectedAt) { this.rejectedAt = rejectedAt; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public BigDecimal getTotalRepayable() { return totalRepayable; }
    public void setTotalRepayable(BigDecimal totalRepayable) { this.totalRepayable = totalRepayable; }
    public BigDecimal getTotalInterest() { return totalInterest; }
    public void setTotalInterest(BigDecimal totalInterest) { this.totalInterest = totalInterest; }
    public BigDecimal getOutstandingBalance() { return outstandingBalance; }
    public void setOutstandingBalance(BigDecimal outstandingBalance) { this.outstandingBalance = outstandingBalance; }
    public Integer getPaidInstallments() { return paidInstallments; }
    public void setPaidInstallments(Integer paidInstallments) { this.paidInstallments = paidInstallments; }
    public Integer getRemainingInstallments() { return remainingInstallments; }
    public void setRemainingInstallments(Integer remainingInstallments) { this.remainingInstallments = remainingInstallments; }
    public LocalDate getNextEmiDate() { return nextEmiDate; }
    public void setNextEmiDate(LocalDate nextEmiDate) { this.nextEmiDate = nextEmiDate; }
    public LocalDate getLastEmiDate() { return lastEmiDate; }
    public void setLastEmiDate(LocalDate lastEmiDate) { this.lastEmiDate = lastEmiDate; }
    public Boolean getFullyRepaid() { return fullyRepaid; }
    public void setFullyRepaid(Boolean fullyRepaid) { this.fullyRepaid = fullyRepaid; }
    public LocalDateTime getRepaidAt() { return repaidAt; }
    public void setRepaidAt(LocalDateTime repaidAt) { this.repaidAt = repaidAt; }
    public Boolean getDeductFromPayroll() { return deductFromPayroll; }
    public void setDeductFromPayroll(Boolean deductFromPayroll) { this.deductFromPayroll = deductFromPayroll; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
