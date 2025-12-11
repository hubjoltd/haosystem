package com.erp.model;

import jakarta.persistence.*;

@Entity
@Table(name = "warehouses")
public class Warehouse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String code;
    private String name;
    private String location;
    private Integer capacity;
    private Integer usedCapacity;
    private String status;
    
    public Warehouse() {}
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public Integer getUsedCapacity() { return usedCapacity; }
    public void setUsedCapacity(Integer usedCapacity) { this.usedCapacity = usedCapacity; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
