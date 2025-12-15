package com.erp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee_education")
public class EmployeeEducation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;
    
    private String qualification;
    private String specialization;
    private String institution;
    private String university;
    private String yearOfPassing;
    private String percentage;
    private String grade;
    
    @Column(columnDefinition = "TEXT")
    private String remarks;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public EmployeeEducation() {}
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }
    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    public String getInstitution() { return institution; }
    public void setInstitution(String institution) { this.institution = institution; }
    public String getUniversity() { return university; }
    public void setUniversity(String university) { this.university = university; }
    public String getYearOfPassing() { return yearOfPassing; }
    public void setYearOfPassing(String yearOfPassing) { this.yearOfPassing = yearOfPassing; }
    public String getPercentage() { return percentage; }
    public void setPercentage(String percentage) { this.percentage = percentage; }
    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
