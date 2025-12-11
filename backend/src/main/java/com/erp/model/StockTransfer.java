package com.erp.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "stock_transfers")
public class StockTransfer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true)
    private String transferNumber;
    
    @ManyToOne
    @JoinColumn(name = "from_warehouse_id")
    private Warehouse fromWarehouse;
    
    @ManyToOne
    @JoinColumn(name = "to_warehouse_id")
    private Warehouse toWarehouse;
    
    private LocalDate transferDate;
    private String remarks;
    private String status;
    private LocalDate createdAt;
    
    public StockTransfer() {}
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTransferNumber() { return transferNumber; }
    public void setTransferNumber(String transferNumber) { this.transferNumber = transferNumber; }
    public Warehouse getFromWarehouse() { return fromWarehouse; }
    public void setFromWarehouse(Warehouse fromWarehouse) { this.fromWarehouse = fromWarehouse; }
    public Warehouse getToWarehouse() { return toWarehouse; }
    public void setToWarehouse(Warehouse toWarehouse) { this.toWarehouse = toWarehouse; }
    public LocalDate getTransferDate() { return transferDate; }
    public void setTransferDate(LocalDate transferDate) { this.transferDate = transferDate; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }
}
