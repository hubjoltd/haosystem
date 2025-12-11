package com.erp.model;

import jakarta.persistence.*;

@Entity
@Table(name = "bins")
public class Bin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String code;
    private String name;
    
    @ManyToOne
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;
    
    private Integer capacity;
    private Integer usedCapacity;
    private String status;
    
    public Bin() {}
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Warehouse getWarehouse() { return warehouse; }
    public void setWarehouse(Warehouse warehouse) { this.warehouse = warehouse; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public Integer getUsedCapacity() { return usedCapacity; }
    public void setUsedCapacity(Integer usedCapacity) { this.usedCapacity = usedCapacity; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
