package com.erp.model;

import jakarta.persistence.*;

@Entity
@Table(name = "customer_statuses")
public class CustomerStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String color;
    
    public CustomerStatus() {}
    
    public CustomerStatus(String name, String color) {
        this.name = name;
        this.color = color;
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
}
