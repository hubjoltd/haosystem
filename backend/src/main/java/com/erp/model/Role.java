package com.erp.model;

import jakarta.persistence.*;

@Entity
@Table(name = "roles", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"name", "branch_id"})
})
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    private String description;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;
    
    @Column(columnDefinition = "TEXT")
    private String permissions;
    
    @Column(name = "is_system_role")
    private Boolean isSystemRole = false;
    
    public Role() {}
    
    public Role(String name, String description, String permissions) {
        this.name = name;
        this.description = description;
        this.permissions = permissions;
    }
    
    public Role(String name, String description, String permissions, Branch branch) {
        this.name = name;
        this.description = description;
        this.permissions = permissions;
        this.branch = branch;
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getPermissions() { return permissions; }
    public void setPermissions(String permissions) { this.permissions = permissions; }
    public Branch getBranch() { return branch; }
    public void setBranch(Branch branch) { this.branch = branch; }
    public Boolean getIsSystemRole() { return isSystemRole; }
    public void setIsSystemRole(Boolean isSystemRole) { this.isSystemRole = isSystemRole; }
    public Long getBranchId() { return branch != null ? branch.getId() : null; }
}
