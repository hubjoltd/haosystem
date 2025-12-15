package com.erp.model;

import jakarta.persistence.*;

@Entity
@Table(name = "cost_centers")
public class CostCenter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true)
    private String code;
    
    private String name;
    private String description;
    
    @ManyToOne
    @JoinColumn(name = "parent_id")
    private CostCenter parent;
    
    private Boolean active = true;
    
    public CostCenter() {}
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public CostCenter getParent() { return parent; }
    public void setParent(CostCenter parent) { this.parent = parent; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
