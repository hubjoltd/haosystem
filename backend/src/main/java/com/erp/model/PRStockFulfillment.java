package com.erp.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pr_stock_fulfillments")
public class PRStockFulfillment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fulfillment_number", unique = true)
    private String fulfillmentNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_requisition_id")
    private PurchaseRequisition purchaseRequisition;

    @Transient
    @JsonProperty("prId")
    private Long prId;

    @Column(name = "pr_number")
    private String prNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "from_warehouse_id")
    private Warehouse fromWarehouse;

    @Transient
    @JsonProperty("warehouseId")
    private Long warehouseId;

    @Column(name = "from_warehouse_name")
    private String fromWarehouseName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Transient
    @JsonProperty("supplierId")
    private Long supplierId;

    @Column(name = "supplier_name")
    private String supplierName;

    @Column(name = "fulfillment_date")
    private LocalDate fulfillmentDate;

    private String status;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "stockFulfillment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PRStockFulfillmentItem> items = new ArrayList<>();

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

    public String getFulfillmentNumber() { return fulfillmentNumber; }
    public void setFulfillmentNumber(String fulfillmentNumber) { this.fulfillmentNumber = fulfillmentNumber; }

    public PurchaseRequisition getPurchaseRequisition() { return purchaseRequisition; }
    public void setPurchaseRequisition(PurchaseRequisition purchaseRequisition) { this.purchaseRequisition = purchaseRequisition; }

    public Long getPrId() { 
        if (prId != null) return prId;
        return purchaseRequisition != null ? purchaseRequisition.getId() : null;
    }
    public void setPrId(Long prId) { this.prId = prId; }

    public String getPrNumber() { return prNumber; }
    public void setPrNumber(String prNumber) { this.prNumber = prNumber; }

    public Warehouse getFromWarehouse() { return fromWarehouse; }
    public void setFromWarehouse(Warehouse fromWarehouse) { this.fromWarehouse = fromWarehouse; }

    public Long getWarehouseId() {
        if (warehouseId != null) return warehouseId;
        return fromWarehouse != null ? fromWarehouse.getId() : null;
    }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }

    public String getFromWarehouseName() { return fromWarehouseName; }
    public void setFromWarehouseName(String fromWarehouseName) { this.fromWarehouseName = fromWarehouseName; }

    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }

    public Long getSupplierId() {
        if (supplierId != null) return supplierId;
        return supplier != null ? supplier.getId() : null;
    }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }

    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }

    public LocalDate getFulfillmentDate() { return fulfillmentDate; }
    public void setFulfillmentDate(LocalDate fulfillmentDate) { this.fulfillmentDate = fulfillmentDate; }

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

    public List<PRStockFulfillmentItem> getItems() { return items; }
    public void setItems(List<PRStockFulfillmentItem> items) { this.items = items; }

    public void addItem(PRStockFulfillmentItem item) {
        items.add(item);
        item.setStockFulfillment(this);
    }

    public void removeItem(PRStockFulfillmentItem item) {
        items.remove(item);
        item.setStockFulfillment(null);
    }
}
