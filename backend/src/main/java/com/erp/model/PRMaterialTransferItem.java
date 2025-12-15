package com.erp.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "pr_material_transfer_items")
public class PRMaterialTransferItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "pr_item_id")
    private Long prItemId;

    @Column(name = "item_id")
    private Long itemId;

    @Column(name = "item_code")
    private String itemCode;

    @Column(name = "item_name")
    private String itemName;

    @Column(name = "requested_quantity")
    private Double requestedQuantity;

    @Column(name = "transferred_quantity")
    @JsonProperty("quantity")
    private Double transferredQuantity;

    private String uom;

    private String remarks;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_transfer_id")
    @JsonIgnore
    private PRMaterialTransfer materialTransfer;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPrItemId() { return prItemId; }
    public void setPrItemId(Long prItemId) { this.prItemId = prItemId; }

    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }

    public String getItemCode() { return itemCode; }
    public void setItemCode(String itemCode) { this.itemCode = itemCode; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public Double getRequestedQuantity() { return requestedQuantity; }
    public void setRequestedQuantity(Double requestedQuantity) { this.requestedQuantity = requestedQuantity; }

    @JsonProperty("quantity")
    public Double getTransferredQuantity() { return transferredQuantity; }
    @JsonProperty("quantity")
    public void setTransferredQuantity(Double transferredQuantity) { this.transferredQuantity = transferredQuantity; }

    public String getUom() { return uom; }
    public void setUom(String uom) { this.uom = uom; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public PRMaterialTransfer getMaterialTransfer() { return materialTransfer; }
    public void setMaterialTransfer(PRMaterialTransfer materialTransfer) { this.materialTransfer = materialTransfer; }
}
