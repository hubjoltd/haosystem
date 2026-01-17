package com.erp.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "reconciliations")
public class Reconciliation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "bank_account_id", nullable = false)
    private BankAccount bankAccount;

    @Column(name = "statement_date", nullable = false)
    private LocalDate statementDate;

    @Column(name = "statement_ending_balance", precision = 15, scale = 2)
    private BigDecimal statementEndingBalance;

    @Column(name = "beginning_balance", precision = 15, scale = 2)
    private BigDecimal beginningBalance;

    @Column(name = "cleared_balance", precision = 15, scale = 2)
    private BigDecimal clearedBalance;

    @Column(name = "difference", precision = 15, scale = 2)
    private BigDecimal difference;

    @Column(name = "is_reconciled")
    private Boolean isReconciled = false;

    @Column(name = "reconciled_date")
    private LocalDateTime reconciledDate;

    @Column(name = "reconciled_by")
    private String reconciledBy;

    private String status = "In Progress";

    private String notes;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "created_by")
    private String createdBy;

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public BankAccount getBankAccount() { return bankAccount; }
    public void setBankAccount(BankAccount bankAccount) { this.bankAccount = bankAccount; }

    public LocalDate getStatementDate() { return statementDate; }
    public void setStatementDate(LocalDate statementDate) { this.statementDate = statementDate; }

    public BigDecimal getStatementEndingBalance() { return statementEndingBalance; }
    public void setStatementEndingBalance(BigDecimal statementEndingBalance) { this.statementEndingBalance = statementEndingBalance; }

    public BigDecimal getBeginningBalance() { return beginningBalance; }
    public void setBeginningBalance(BigDecimal beginningBalance) { this.beginningBalance = beginningBalance; }

    public BigDecimal getClearedBalance() { return clearedBalance; }
    public void setClearedBalance(BigDecimal clearedBalance) { this.clearedBalance = clearedBalance; }

    public BigDecimal getDifference() { return difference; }
    public void setDifference(BigDecimal difference) { this.difference = difference; }

    public Boolean getIsReconciled() { return isReconciled; }
    public void setIsReconciled(Boolean isReconciled) { this.isReconciled = isReconciled; }

    public LocalDateTime getReconciledDate() { return reconciledDate; }
    public void setReconciledDate(LocalDateTime reconciledDate) { this.reconciledDate = reconciledDate; }

    public String getReconciledBy() { return reconciledBy; }
    public void setReconciledBy(String reconciledBy) { this.reconciledBy = reconciledBy; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
