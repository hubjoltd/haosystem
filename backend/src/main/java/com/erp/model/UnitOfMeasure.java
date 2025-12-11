package com.erp.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "units_of_measure")
public class UnitOfMeasure {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String code;
    
    @Column(nullable = false)
    private String name;
    
    private String symbol;
    
    @Column(precision = 18, scale = 6)
    private BigDecimal conversionFactor = BigDecimal.ONE;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "base_uom_id")
    private UnitOfMeasure baseUom;
    
    @Column(nullable = false)
    private String status = "Active";
    
    private String createdBy;
    private LocalDateTime createdDate;
    private String updatedBy;
    private LocalDateTime updatedDate;
    
    public UnitOfMeasure() {}
    
    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
        if (status == null) status = "Active";
        if (conversionFactor == null) conversionFactor = BigDecimal.ONE;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedDate = LocalDateTime.now();
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }
    public BigDecimal getConversionFactor() { return conversionFactor; }
    public void setConversionFactor(BigDecimal conversionFactor) { this.conversionFactor = conversionFactor; }
    public UnitOfMeasure getBaseUom() { return baseUom; }
    public void setBaseUom(UnitOfMeasure baseUom) { this.baseUom = baseUom; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
    public LocalDateTime getUpdatedDate() { return updatedDate; }
    public void setUpdatedDate(LocalDateTime updatedDate) { this.updatedDate = updatedDate; }
    
    public boolean isBaseUom() {
        return baseUom == null;
    }
}
