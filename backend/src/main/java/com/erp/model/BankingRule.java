package com.erp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "banking_rules")
public class BankingRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne
    @JoinColumn(name = "bank_account_id")
    private BankAccount bankAccount;

    @Column(name = "apply_to_all_accounts")
    private Boolean applyToAllAccounts = false;

    @Column(name = "transaction_type")
    private String transactionType;

    @Column(name = "condition_field")
    private String conditionField;

    @Column(name = "condition_operator")
    private String conditionOperator;

    @Column(name = "condition_value")
    private String conditionValue;

    @Column(name = "secondary_condition_field")
    private String secondaryConditionField;

    @Column(name = "secondary_condition_operator")
    private String secondaryConditionOperator;

    @Column(name = "secondary_condition_value")
    private String secondaryConditionValue;

    @Column(name = "condition_logic")
    private String conditionLogic = "AND";

    @ManyToOne
    @JoinColumn(name = "assign_account_id")
    private ChartOfAccount assignAccount;

    @Column(name = "assign_payee")
    private String assignPayee;

    @Column(name = "assign_memo")
    private String assignMemo;

    @Column(name = "auto_confirm")
    private Boolean autoConfirm = false;

    @Column(name = "is_active")
    private Boolean isActive = true;

    private Integer priority = 0;

    @Column(name = "times_applied")
    private Integer timesApplied = 0;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "modified_date")
    private LocalDateTime modifiedDate;

    @Column(name = "modified_by")
    private String modifiedBy;

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        modifiedDate = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BankAccount getBankAccount() { return bankAccount; }
    public void setBankAccount(BankAccount bankAccount) { this.bankAccount = bankAccount; }

    public Boolean getApplyToAllAccounts() { return applyToAllAccounts; }
    public void setApplyToAllAccounts(Boolean applyToAllAccounts) { this.applyToAllAccounts = applyToAllAccounts; }

    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }

    public String getConditionField() { return conditionField; }
    public void setConditionField(String conditionField) { this.conditionField = conditionField; }

    public String getConditionOperator() { return conditionOperator; }
    public void setConditionOperator(String conditionOperator) { this.conditionOperator = conditionOperator; }

    public String getConditionValue() { return conditionValue; }
    public void setConditionValue(String conditionValue) { this.conditionValue = conditionValue; }

    public String getSecondaryConditionField() { return secondaryConditionField; }
    public void setSecondaryConditionField(String secondaryConditionField) { this.secondaryConditionField = secondaryConditionField; }

    public String getSecondaryConditionOperator() { return secondaryConditionOperator; }
    public void setSecondaryConditionOperator(String secondaryConditionOperator) { this.secondaryConditionOperator = secondaryConditionOperator; }

    public String getSecondaryConditionValue() { return secondaryConditionValue; }
    public void setSecondaryConditionValue(String secondaryConditionValue) { this.secondaryConditionValue = secondaryConditionValue; }

    public String getConditionLogic() { return conditionLogic; }
    public void setConditionLogic(String conditionLogic) { this.conditionLogic = conditionLogic; }

    public ChartOfAccount getAssignAccount() { return assignAccount; }
    public void setAssignAccount(ChartOfAccount assignAccount) { this.assignAccount = assignAccount; }

    public String getAssignPayee() { return assignPayee; }
    public void setAssignPayee(String assignPayee) { this.assignPayee = assignPayee; }

    public String getAssignMemo() { return assignMemo; }
    public void setAssignMemo(String assignMemo) { this.assignMemo = assignMemo; }

    public Boolean getAutoConfirm() { return autoConfirm; }
    public void setAutoConfirm(Boolean autoConfirm) { this.autoConfirm = autoConfirm; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Integer getPriority() { return priority; }
    public void setPriority(Integer priority) { this.priority = priority; }

    public Integer getTimesApplied() { return timesApplied; }
    public void setTimesApplied(Integer timesApplied) { this.timesApplied = timesApplied; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getModifiedDate() { return modifiedDate; }
    public void setModifiedDate(LocalDateTime modifiedDate) { this.modifiedDate = modifiedDate; }

    public String getModifiedBy() { return modifiedBy; }
    public void setModifiedBy(String modifiedBy) { this.modifiedBy = modifiedBy; }
}
