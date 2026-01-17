package com.erp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "account_mappings")
public class AccountMapping {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "branch_id")
    private Branch branch;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MappingType mappingType;
    
    @Column(nullable = false)
    private String mappingKey;
    
    @Column
    private String mappingLabel;
    
    @Column
    private String description;
    
    @ManyToOne
    @JoinColumn(name = "debit_account_id")
    private ChartOfAccount debitAccount;
    
    @ManyToOne
    @JoinColumn(name = "credit_account_id")
    private ChartOfAccount creditAccount;
    
    @Column
    private Boolean active = true;
    
    @Column(name = "display_order")
    private Integer displayOrder;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "created_by")
    private String createdBy;
    
    public AccountMapping() {}
    
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
    
    public Branch getBranch() { return branch; }
    public void setBranch(Branch branch) { this.branch = branch; }
    
    public MappingType getMappingType() { return mappingType; }
    public void setMappingType(MappingType mappingType) { this.mappingType = mappingType; }
    
    public String getMappingKey() { return mappingKey; }
    public void setMappingKey(String mappingKey) { this.mappingKey = mappingKey; }
    
    public String getMappingLabel() { return mappingLabel; }
    public void setMappingLabel(String mappingLabel) { this.mappingLabel = mappingLabel; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public ChartOfAccount getDebitAccount() { return debitAccount; }
    public void setDebitAccount(ChartOfAccount debitAccount) { this.debitAccount = debitAccount; }
    
    public ChartOfAccount getCreditAccount() { return creditAccount; }
    public void setCreditAccount(ChartOfAccount creditAccount) { this.creditAccount = creditAccount; }
    
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
