package com.erp.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "purchase_requisition_items")
public class PurchaseRequisitionItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "item_name")
    private String itemName;

    @Column(name = "item_description")
    private String itemDescription;

    private Double quantity;

    @Column(name = "fulfilled_quantity")
    private Double fulfilledQuantity;

    private String uom;

    private String remarks;

    private String status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_requisition_id")
    @JsonIgnore
    private PurchaseRequisition purchaseRequisition;

    @PrePersist
    protected void onCreate() {
        if (fulfilledQuantity == null) fulfilledQuantity = 0.0;
        if (status == null) status = "Pending";
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public String getItemDescription() { return itemDescription; }
    public void setItemDescription(String itemDescription) { this.itemDescription = itemDescription; }

    public Double getQuantity() { return quantity; }
    public void setQuantity(Double quantity) { this.quantity = quantity; }

    public Double getFulfilledQuantity() { return fulfilledQuantity; }
    public void setFulfilledQuantity(Double fulfilledQuantity) { this.fulfilledQuantity = fulfilledQuantity; }

    public String getUom() { return uom; }
    public void setUom(String uom) { this.uom = uom; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public PurchaseRequisition getPurchaseRequisition() { return purchaseRequisition; }
    public void setPurchaseRequisition(PurchaseRequisition purchaseRequisition) { this.purchaseRequisition = purchaseRequisition; }
}
