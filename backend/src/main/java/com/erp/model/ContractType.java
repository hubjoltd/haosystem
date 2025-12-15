package com.erp.model;

import jakarta.persistence.*;

@Entity
@Table(name = "contract_types")
public class ContractType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private Integer duration;
    private Boolean renewable;
    
    public ContractType() {}
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }
    public Boolean getRenewable() { return renewable; }
    public void setRenewable(Boolean renewable) { this.renewable = renewable; }
}
