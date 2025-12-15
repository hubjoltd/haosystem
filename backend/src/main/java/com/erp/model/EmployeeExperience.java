package com.erp.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee_experience")
public class EmployeeExperience {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;
    
    private String companyName;
    private String designation;
    private LocalDate fromDate;
    private LocalDate toDate;
    private String location;
    
    @Column(columnDefinition = "TEXT")
    private String responsibilities;
    
    private String reasonForLeaving;
    private String lastSalary;
    private String referenceContact;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public EmployeeExperience() {}
    
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
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
    public LocalDate getFromDate() { return fromDate; }
    public void setFromDate(LocalDate fromDate) { this.fromDate = fromDate; }
    public LocalDate getToDate() { return toDate; }
    public void setToDate(LocalDate toDate) { this.toDate = toDate; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getResponsibilities() { return responsibilities; }
    public void setResponsibilities(String responsibilities) { this.responsibilities = responsibilities; }
    public String getReasonForLeaving() { return reasonForLeaving; }
    public void setReasonForLeaving(String reasonForLeaving) { this.reasonForLeaving = reasonForLeaving; }
    public String getLastSalary() { return lastSalary; }
    public void setLastSalary(String lastSalary) { this.lastSalary = lastSalary; }
    public String getReferenceContact() { return referenceContact; }
    public void setReferenceContact(String referenceContact) { this.referenceContact = referenceContact; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
