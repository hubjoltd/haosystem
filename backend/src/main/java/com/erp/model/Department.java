package com.erp.model;

import jakarta.persistence.*;

@Entity
@Table(name = "departments")
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true)
    private String code;
    
    private String name;
    private String description;
    
    @ManyToOne
    @JoinColumn(name = "parent_id")
    private Department parent;
    
    @ManyToOne
    @JoinColumn(name = "cost_center_id")
    private CostCenter costCenter;
    
    @ManyToOne
    @JoinColumn(name = "location_id")
    private Location location;
    
    private Boolean active = true;
    
    @ManyToOne
    @JoinColumn(name = "branch_id")
    private Branch branch;
    
    public Department() {}
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Department getParent() { return parent; }
    public void setParent(Department parent) { this.parent = parent; }
    public CostCenter getCostCenter() { return costCenter; }
    public void setCostCenter(CostCenter costCenter) { this.costCenter = costCenter; }
    public Location getLocation() { return location; }
    public void setLocation(Location location) { this.location = location; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public Branch getBranch() { return branch; }
    public void setBranch(Branch branch) { this.branch = branch; }
}
