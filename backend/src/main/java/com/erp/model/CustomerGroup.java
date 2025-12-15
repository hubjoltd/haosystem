package com.erp.model;

import jakarta.persistence.*;

@Entity
@Table(name = "customer_groups")
public class CustomerGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String description;
    private Double discount;
    
    public CustomerGroup() {}
    
    public CustomerGroup(String name, String description, Double discount) {
        this.name = name;
        this.description = description;
        this.discount = discount;
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getDiscount() { return discount; }
    public void setDiscount(Double discount) { this.discount = discount; }
}
