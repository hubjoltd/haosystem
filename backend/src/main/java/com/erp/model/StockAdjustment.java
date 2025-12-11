package com.erp.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "stock_adjustments")
public class StockAdjustment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true)
    private String adjustmentNumber;
    
    @ManyToOne
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;
    
    @ManyToOne
    @JoinColumn(name = "item_id")
    private Item item;
    
    @ManyToOne
    @JoinColumn(name = "bin_id")
    private Bin bin;
    
    private String adjustmentType;
    private Integer quantityBefore;
    private Integer quantityAdjusted;
    private Integer quantityAfter;
    private BigDecimal valueDifference;
    private String reason;
    private LocalDate adjustmentDate;
    private String status;
    private LocalDate createdAt;
    
    public StockAdjustment() {}
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAdjustmentNumber() { return adjustmentNumber; }
    public void setAdjustmentNumber(String adjustmentNumber) { this.adjustmentNumber = adjustmentNumber; }
    public Warehouse getWarehouse() { return warehouse; }
    public void setWarehouse(Warehouse warehouse) { this.warehouse = warehouse; }
    public Item getItem() { return item; }
    public void setItem(Item item) { this.item = item; }
    public Bin getBin() { return bin; }
    public void setBin(Bin bin) { this.bin = bin; }
    public String getAdjustmentType() { return adjustmentType; }
    public void setAdjustmentType(String adjustmentType) { this.adjustmentType = adjustmentType; }
    public Integer getQuantityBefore() { return quantityBefore; }
    public void setQuantityBefore(Integer quantityBefore) { this.quantityBefore = quantityBefore; }
    public Integer getQuantityAdjusted() { return quantityAdjusted; }
    public void setQuantityAdjusted(Integer quantityAdjusted) { this.quantityAdjusted = quantityAdjusted; }
    public Integer getQuantityAfter() { return quantityAfter; }
    public void setQuantityAfter(Integer quantityAfter) { this.quantityAfter = quantityAfter; }
    public BigDecimal getValueDifference() { return valueDifference; }
    public void setValueDifference(BigDecimal valueDifference) { this.valueDifference = valueDifference; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public LocalDate getAdjustmentDate() { return adjustmentDate; }
    public void setAdjustmentDate(LocalDate adjustmentDate) { this.adjustmentDate = adjustmentDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }
}
