package com.erp.model;

import jakarta.persistence.*;

@Entity
@Table(name = "expense_centers")
public class ExpenseCenter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true)
    private String code;
    
    private String name;
    private String description;
    
    @ManyToOne
    @JoinColumn(name = "cost_center_id")
    private CostCenter costCenter;
    
    private Boolean active = true;
    
    public ExpenseCenter() {}
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public CostCenter getCostCenter() { return costCenter; }
    public void setCostCenter(CostCenter costCenter) { this.costCenter = costCenter; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
