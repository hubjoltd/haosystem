package com.erp.model;

import jakarta.persistence.*;

@Entity
@Table(name = "units_of_measure")
public class UnitOfMeasure {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true)
    private String code;
    private String name;
    private String symbol;
    private String status;
    
    public UnitOfMeasure() {}
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
