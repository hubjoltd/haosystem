package com.erp.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pr_material_transfers")
public class PRMaterialTransfer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transfer_number", unique = true)
    private String transferNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_requisition_id")
    private PurchaseRequisition purchaseRequisition;

    @Transient
    @JsonProperty("prId")
    private Long prId;

    @Column(name = "pr_number")
    private String prNumber;

    @Column(name = "from_project")
    @JsonProperty("projectName")
    private String fromProject;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Transient
    @JsonProperty("supplierId")
    private Long supplierId;

    @Column(name = "supplier_name")
    private String supplierName;

    @Column(name = "transfer_date")
    private LocalDate transferDate;

    private String status;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "materialTransfer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PRMaterialTransferItem> items = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = "Completed";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTransferNumber() { return transferNumber; }
    public void setTransferNumber(String transferNumber) { this.transferNumber = transferNumber; }

    public PurchaseRequisition getPurchaseRequisition() { return purchaseRequisition; }
    public void setPurchaseRequisition(PurchaseRequisition purchaseRequisition) { this.purchaseRequisition = purchaseRequisition; }

    public Long getPrId() {
        if (prId != null) return prId;
        return purchaseRequisition != null ? purchaseRequisition.getId() : null;
    }
    public void setPrId(Long prId) { this.prId = prId; }

    public String getPrNumber() { return prNumber; }
    public void setPrNumber(String prNumber) { this.prNumber = prNumber; }

    public String getFromProject() { return fromProject; }
    public void setFromProject(String fromProject) { this.fromProject = fromProject; }

    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }

    public Long getSupplierId() {
        if (supplierId != null) return supplierId;
        return supplier != null ? supplier.getId() : null;
    }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }

    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }

    public LocalDate getTransferDate() { return transferDate; }
    public void setTransferDate(LocalDate transferDate) { this.transferDate = transferDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<PRMaterialTransferItem> getItems() { return items; }
    public void setItems(List<PRMaterialTransferItem> items) { this.items = items; }

    public void addItem(PRMaterialTransferItem item) {
        items.add(item);
        item.setMaterialTransfer(this);
    }

    public void removeItem(PRMaterialTransferItem item) {
        items.remove(item);
        item.setMaterialTransfer(null);
    }
}
