package com.erp.model;

import jakarta.persistence.*;

@Entity
@Table(name = "designations")
public class Designation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true)
    private String code;
    
    private String title;
    private String description;
    
    @ManyToOne
    @JoinColumn(name = "grade_id")
    private Grade grade;
    
    private Boolean active = true;
    
    public Designation() {}
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Grade getGrade() { return grade; }
    public void setGrade(Grade grade) { this.grade = grade; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
