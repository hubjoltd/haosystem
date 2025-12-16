package com.erp.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "expense_items")
public class ExpenseItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "expense_request_id", nullable = false)
    private ExpenseRequest expenseRequest;
    
    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private ExpenseCategory category;
    
    @Column(nullable = false, length = 200)
    private String description;
    
    private LocalDate expenseDate;
    
    @Column(length = 100)
    private String vendor;
    
    @Column(nullable = false)
    private BigDecimal amount;
    
    @Column(length = 3)
    private String currency = "USD";
    
    private BigDecimal exchangeRate = BigDecimal.ONE;
    
    private BigDecimal amountInBaseCurrency;
    
    private Integer quantity = 1;
    
    private BigDecimal unitPrice;
    
    @Column(length = 100)
    private String receiptNumber;
    
    @Column(length = 500)
    private String receiptUrl;
    
    private Boolean receiptAttached = false;
    
    @Column(length = 20)
    private String paymentMethod;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    private Boolean billable = false;
    
    @Column(length = 50)
    private String clientCode;
    
    private Boolean approved = false;
    
    private BigDecimal approvedAmount;
    
    @Column(columnDefinition = "TEXT")
    private String approvalNotes;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public ExpenseItem() {}
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        calculateAmountInBaseCurrency();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        calculateAmountInBaseCurrency();
    }
    
    private void calculateAmountInBaseCurrency() {
        if (amount != null && exchangeRate != null) {
            amountInBaseCurrency = amount.multiply(exchangeRate);
        }
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ExpenseRequest getExpenseRequest() { return expenseRequest; }
    public void setExpenseRequest(ExpenseRequest expenseRequest) { this.expenseRequest = expenseRequest; }
    public ExpenseCategory getCategory() { return category; }
    public void setCategory(ExpenseCategory category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getExpenseDate() { return expenseDate; }
    public void setExpenseDate(LocalDate expenseDate) { this.expenseDate = expenseDate; }
    public String getVendor() { return vendor; }
    public void setVendor(String vendor) { this.vendor = vendor; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public BigDecimal getExchangeRate() { return exchangeRate; }
    public void setExchangeRate(BigDecimal exchangeRate) { this.exchangeRate = exchangeRate; }
    public BigDecimal getAmountInBaseCurrency() { return amountInBaseCurrency; }
    public void setAmountInBaseCurrency(BigDecimal amountInBaseCurrency) { this.amountInBaseCurrency = amountInBaseCurrency; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public String getReceiptNumber() { return receiptNumber; }
    public void setReceiptNumber(String receiptNumber) { this.receiptNumber = receiptNumber; }
    public String getReceiptUrl() { return receiptUrl; }
    public void setReceiptUrl(String receiptUrl) { this.receiptUrl = receiptUrl; }
    public Boolean getReceiptAttached() { return receiptAttached; }
    public void setReceiptAttached(Boolean receiptAttached) { this.receiptAttached = receiptAttached; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Boolean getBillable() { return billable; }
    public void setBillable(Boolean billable) { this.billable = billable; }
    public String getClientCode() { return clientCode; }
    public void setClientCode(String clientCode) { this.clientCode = clientCode; }
    public Boolean getApproved() { return approved; }
    public void setApproved(Boolean approved) { this.approved = approved; }
    public BigDecimal getApprovedAmount() { return approvedAmount; }
    public void setApprovedAmount(BigDecimal approvedAmount) { this.approvedAmount = approvedAmount; }
    public String getApprovalNotes() { return approvalNotes; }
    public void setApprovalNotes(String approvalNotes) { this.approvalNotes = approvalNotes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
