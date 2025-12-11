package com.erp.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_ledger")
public class InventoryLedger {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "item_id")
    private Item item;
    
    @ManyToOne
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;
    
    @ManyToOne
    @JoinColumn(name = "bin_id")
    private Bin bin;
    
    private String transactionType;
    private String referenceNumber;
    private Integer quantityIn;
    private Integer quantityOut;
    private Integer balanceQuantity;
    private BigDecimal unitValue;
    private BigDecimal totalValue;
    private LocalDateTime transactionDate;
    private String remarks;
    
    public InventoryLedger() {}
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Item getItem() { return item; }
    public void setItem(Item item) { this.item = item; }
    public Warehouse getWarehouse() { return warehouse; }
    public void setWarehouse(Warehouse warehouse) { this.warehouse = warehouse; }
    public Bin getBin() { return bin; }
    public void setBin(Bin bin) { this.bin = bin; }
    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }
    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }
    public Integer getQuantityIn() { return quantityIn; }
    public void setQuantityIn(Integer quantityIn) { this.quantityIn = quantityIn; }
    public Integer getQuantityOut() { return quantityOut; }
    public void setQuantityOut(Integer quantityOut) { this.quantityOut = quantityOut; }
    public Integer getBalanceQuantity() { return balanceQuantity; }
    public void setBalanceQuantity(Integer balanceQuantity) { this.balanceQuantity = balanceQuantity; }
    public BigDecimal getUnitValue() { return unitValue; }
    public void setUnitValue(BigDecimal unitValue) { this.unitValue = unitValue; }
    public BigDecimal getTotalValue() { return totalValue; }
    public void setTotalValue(BigDecimal totalValue) { this.totalValue = totalValue; }
    public LocalDateTime getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDateTime transactionDate) { this.transactionDate = transactionDate; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
