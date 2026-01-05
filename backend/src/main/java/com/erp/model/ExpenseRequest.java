package com.erp.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "expense_requests")
public class ExpenseRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 30)
    private String requestNumber;
    
    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private LocalDate expenseDate;
    
    private LocalDate periodFrom;
    private LocalDate periodTo;
    
    @ManyToOne
    @JoinColumn(name = "cost_center_id")
    private CostCenter costCenter;
    
    @Column(length = 50)
    private String projectCode;
    
    @Column(nullable = false)
    private BigDecimal totalAmount = BigDecimal.ZERO;
    
    @Column(nullable = false)
    private BigDecimal approvedAmount = BigDecimal.ZERO;
    
    @Column(nullable = false, length = 20)
    private String status;
    
    @ManyToOne
    @JoinColumn(name = "approver_id")
    private Employee approver;
    
    private LocalDateTime submittedAt;
    
    private LocalDateTime approvedAt;
    
    @Column(columnDefinition = "TEXT")
    private String approverRemarks;
    
    private LocalDateTime rejectedAt;
    
    @Column(columnDefinition = "TEXT")
    private String rejectionReason;
    
    private Boolean reimbursementRequired = true;
    
    @Column(length = 20)
    private String reimbursementStatus;
    
    @ManyToOne
    @JoinColumn(name = "payroll_record_id")
    private PayrollRecord payrollRecord;
    
    private LocalDateTime reimbursedAt;
    
    private Boolean postedToAccounts = false;
    
    private LocalDateTime postedAt;
    
    @Column(length = 100)
    private String accountingReference;
    
    @Column(length = 100)
    private String receiptNumber;
    
    @Column(columnDefinition = "TEXT")
    private String receiptUrl;
    
    @OneToMany(mappedBy = "expenseRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExpenseItem> items = new ArrayList<>();
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
    
    public ExpenseRequest() {}
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = "DRAFT";
        if (totalAmount == null) totalAmount = BigDecimal.ZERO;
        if (approvedAmount == null) approvedAmount = BigDecimal.ZERO;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public void addItem(ExpenseItem item) {
        items.add(item);
        item.setExpenseRequest(this);
        recalculateTotal();
    }
    
    public void removeItem(ExpenseItem item) {
        items.remove(item);
        item.setExpenseRequest(null);
        recalculateTotal();
    }
    
    public void recalculateTotal() {
        this.totalAmount = items.stream()
            .map(ExpenseItem::getAmount)
            .filter(a -> a != null)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRequestNumber() { return requestNumber; }
    public void setRequestNumber(String requestNumber) { this.requestNumber = requestNumber; }
    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getExpenseDate() { return expenseDate; }
    public void setExpenseDate(LocalDate expenseDate) { this.expenseDate = expenseDate; }
    public LocalDate getPeriodFrom() { return periodFrom; }
    public void setPeriodFrom(LocalDate periodFrom) { this.periodFrom = periodFrom; }
    public LocalDate getPeriodTo() { return periodTo; }
    public void setPeriodTo(LocalDate periodTo) { this.periodTo = periodTo; }
    public CostCenter getCostCenter() { return costCenter; }
    public void setCostCenter(CostCenter costCenter) { this.costCenter = costCenter; }
    public String getProjectCode() { return projectCode; }
    public void setProjectCode(String projectCode) { this.projectCode = projectCode; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public BigDecimal getApprovedAmount() { return approvedAmount; }
    public void setApprovedAmount(BigDecimal approvedAmount) { this.approvedAmount = approvedAmount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Employee getApprover() { return approver; }
    public void setApprover(Employee approver) { this.approver = approver; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }
    public String getApproverRemarks() { return approverRemarks; }
    public void setApproverRemarks(String approverRemarks) { this.approverRemarks = approverRemarks; }
    public LocalDateTime getRejectedAt() { return rejectedAt; }
    public void setRejectedAt(LocalDateTime rejectedAt) { this.rejectedAt = rejectedAt; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public Boolean getReimbursementRequired() { return reimbursementRequired; }
    public void setReimbursementRequired(Boolean reimbursementRequired) { this.reimbursementRequired = reimbursementRequired; }
    public String getReimbursementStatus() { return reimbursementStatus; }
    public void setReimbursementStatus(String reimbursementStatus) { this.reimbursementStatus = reimbursementStatus; }
    public PayrollRecord getPayrollRecord() { return payrollRecord; }
    public void setPayrollRecord(PayrollRecord payrollRecord) { this.payrollRecord = payrollRecord; }
    public LocalDateTime getReimbursedAt() { return reimbursedAt; }
    public void setReimbursedAt(LocalDateTime reimbursedAt) { this.reimbursedAt = reimbursedAt; }
    public Boolean getPostedToAccounts() { return postedToAccounts; }
    public void setPostedToAccounts(Boolean postedToAccounts) { this.postedToAccounts = postedToAccounts; }
    public LocalDateTime getPostedAt() { return postedAt; }
    public void setPostedAt(LocalDateTime postedAt) { this.postedAt = postedAt; }
    public String getAccountingReference() { return accountingReference; }
    public void setAccountingReference(String accountingReference) { this.accountingReference = accountingReference; }
    public String getReceiptNumber() { return receiptNumber; }
    public void setReceiptNumber(String receiptNumber) { this.receiptNumber = receiptNumber; }
    public String getReceiptUrl() { return receiptUrl; }
    public void setReceiptUrl(String receiptUrl) { this.receiptUrl = receiptUrl; }
    public List<ExpenseItem> getItems() { return items; }
    public void setItems(List<ExpenseItem> items) { this.items = items; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
}
