package com.erp.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "salary_bands")
public class SalaryBand {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 30)
    private String bandCode;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @ManyToOne
    @JoinColumn(name = "grade_id")
    private Grade grade;
    
    @ManyToOne
    @JoinColumn(name = "job_role_id")
    private JobRole jobRole;
    
    private BigDecimal minSalary;
    private BigDecimal midSalary;
    private BigDecimal maxSalary;
    
    @Column(length = 10)
    private String currency = "USD";
    
    @Column(length = 30)
    private String payFrequency;
    
    private BigDecimal hraPercentage;
    private BigDecimal daPercentage;
    private BigDecimal taPercentage;
    private BigDecimal medicalAllowancePercentage;
    private BigDecimal specialAllowancePercentage;
    
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    
    private Boolean isActive = true;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    
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
    public String getBandCode() { return bandCode; }
    public void setBandCode(String bandCode) { this.bandCode = bandCode; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Grade getGrade() { return grade; }
    public void setGrade(Grade grade) { this.grade = grade; }
    public JobRole getJobRole() { return jobRole; }
    public void setJobRole(JobRole jobRole) { this.jobRole = jobRole; }
    public BigDecimal getMinSalary() { return minSalary; }
    public void setMinSalary(BigDecimal minSalary) { this.minSalary = minSalary; }
    public BigDecimal getMidSalary() { return midSalary; }
    public void setMidSalary(BigDecimal midSalary) { this.midSalary = midSalary; }
    public BigDecimal getMaxSalary() { return maxSalary; }
    public void setMaxSalary(BigDecimal maxSalary) { this.maxSalary = maxSalary; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getPayFrequency() { return payFrequency; }
    public void setPayFrequency(String payFrequency) { this.payFrequency = payFrequency; }
    public BigDecimal getHraPercentage() { return hraPercentage; }
    public void setHraPercentage(BigDecimal hraPercentage) { this.hraPercentage = hraPercentage; }
    public BigDecimal getDaPercentage() { return daPercentage; }
    public void setDaPercentage(BigDecimal daPercentage) { this.daPercentage = daPercentage; }
    public BigDecimal getTaPercentage() { return taPercentage; }
    public void setTaPercentage(BigDecimal taPercentage) { this.taPercentage = taPercentage; }
    public BigDecimal getMedicalAllowancePercentage() { return medicalAllowancePercentage; }
    public void setMedicalAllowancePercentage(BigDecimal medicalAllowancePercentage) { this.medicalAllowancePercentage = medicalAllowancePercentage; }
    public BigDecimal getSpecialAllowancePercentage() { return specialAllowancePercentage; }
    public void setSpecialAllowancePercentage(BigDecimal specialAllowancePercentage) { this.specialAllowancePercentage = specialAllowancePercentage; }
    public LocalDate getEffectiveFrom() { return effectiveFrom; }
    public void setEffectiveFrom(LocalDate effectiveFrom) { this.effectiveFrom = effectiveFrom; }
    public LocalDate getEffectiveTo() { return effectiveTo; }
    public void setEffectiveTo(LocalDate effectiveTo) { this.effectiveTo = effectiveTo; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
