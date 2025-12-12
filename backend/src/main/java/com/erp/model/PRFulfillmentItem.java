package com.erp.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "pr_fulfillment_items")
public class PRFulfillmentItem {
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

    @Column(name = "item_description")
    private String itemDescription;

    @Column(name = "requested_qty")
    private Double requestedQty;

    @Column(name = "fulfilled_qty")
    private Double fulfilledQty;

    @Column(name = "pending_qty")
    private Double pendingQty;

    private String uom;

    @Column(name = "fulfill_qty")
    private Double fulfillQty;

    private Double rate;

    private Double amount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pr_fulfillment_id")
    @JsonIgnore
    private PRFulfillment prFulfillment;

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

    public String getItemDescription() { return itemDescription; }
    public void setItemDescription(String itemDescription) { this.itemDescription = itemDescription; }

    public Double getRequestedQty() { return requestedQty; }
    public void setRequestedQty(Double requestedQty) { this.requestedQty = requestedQty; }

    public Double getFulfilledQty() { return fulfilledQty; }
    public void setFulfilledQty(Double fulfilledQty) { this.fulfilledQty = fulfilledQty; }

    public Double getPendingQty() { return pendingQty; }
    public void setPendingQty(Double pendingQty) { this.pendingQty = pendingQty; }

    public String getUom() { return uom; }
    public void setUom(String uom) { this.uom = uom; }

    public Double getFulfillQty() { return fulfillQty; }
    public void setFulfillQty(Double fulfillQty) { this.fulfillQty = fulfillQty; }

    public Double getRate() { return rate; }
    public void setRate(Double rate) { this.rate = rate; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public PRFulfillment getPrFulfillment() { return prFulfillment; }
    public void setPrFulfillment(PRFulfillment prFulfillment) { this.prFulfillment = prFulfillment; }
}
