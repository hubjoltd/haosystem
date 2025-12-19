package com.erp.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_requisitions")
public class JobRequisition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 30)
    private String requisitionNumber;
    
    @Column(nullable = false, length = 200)
    private String positionTitle;
    
    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;
    
    @ManyToOne
    @JoinColumn(name = "job_role_id")
    private JobRole jobRole;
    
    @ManyToOne
    @JoinColumn(name = "grade_id")
    private Grade grade;
    
    @ManyToOne
    @JoinColumn(name = "location_id")
    private Location location;
    
    @ManyToOne
    @JoinColumn(name = "reporting_to_id")
    private Employee reportingTo;
    
    private Integer numberOfPositions = 1;
    
    @Column(length = 50)
    private String employmentType;
    
    @Column(length = 50)
    private String requisitionType;
    
    @Column(columnDefinition = "TEXT")
    private String justification;
    
    @Column(columnDefinition = "TEXT")
    private String jobDescription;
    
    @Column(columnDefinition = "TEXT")
    private String requirements;
    
    @Column(columnDefinition = "TEXT")
    private String skills;
    
    private Integer minExperience;
    private Integer maxExperience;
    
    @Column(length = 100)
    private String educationRequirement;
    
    private java.math.BigDecimal budgetedSalaryMin;
    private java.math.BigDecimal budgetedSalaryMax;
    
    @Column(length = 20)
    private String priority;
    
    private LocalDate targetJoinDate;
    
    @Column(nullable = false, length = 30)
    private String status = "DRAFT";
    
    @ManyToOne
    @JoinColumn(name = "requested_by_id")
    private Employee requestedBy;
    
    private LocalDateTime submittedAt;
    
    @ManyToOne
    @JoinColumn(name = "approved_by_id")
    private Employee approvedBy;
    
    private LocalDateTime approvedAt;
    
    @Column(columnDefinition = "TEXT")
    private String approverRemarks;
    
    private LocalDateTime rejectedAt;
    
    @Column(columnDefinition = "TEXT")
    private String rejectionReason;
    
    private Integer filledPositions = 0;
    
    private LocalDateTime closedAt;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
    
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
    public String getRequisitionNumber() { return requisitionNumber; }
    public void setRequisitionNumber(String requisitionNumber) { this.requisitionNumber = requisitionNumber; }
    public String getPositionTitle() { return positionTitle; }
    public void setPositionTitle(String positionTitle) { this.positionTitle = positionTitle; }
    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }
    public JobRole getJobRole() { return jobRole; }
    public void setJobRole(JobRole jobRole) { this.jobRole = jobRole; }
    public Grade getGrade() { return grade; }
    public void setGrade(Grade grade) { this.grade = grade; }
    public Location getLocation() { return location; }
    public void setLocation(Location location) { this.location = location; }
    public Employee getReportingTo() { return reportingTo; }
    public void setReportingTo(Employee reportingTo) { this.reportingTo = reportingTo; }
    public Integer getNumberOfPositions() { return numberOfPositions; }
    public void setNumberOfPositions(Integer numberOfPositions) { this.numberOfPositions = numberOfPositions; }
    public String getEmploymentType() { return employmentType; }
    public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }
    public String getRequisitionType() { return requisitionType; }
    public void setRequisitionType(String requisitionType) { this.requisitionType = requisitionType; }
    public String getJustification() { return justification; }
    public void setJustification(String justification) { this.justification = justification; }
    public String getJobDescription() { return jobDescription; }
    public void setJobDescription(String jobDescription) { this.jobDescription = jobDescription; }
    public String getRequirements() { return requirements; }
    public void setRequirements(String requirements) { this.requirements = requirements; }
    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }
    public Integer getMinExperience() { return minExperience; }
    public void setMinExperience(Integer minExperience) { this.minExperience = minExperience; }
    public Integer getMaxExperience() { return maxExperience; }
    public void setMaxExperience(Integer maxExperience) { this.maxExperience = maxExperience; }
    public String getEducationRequirement() { return educationRequirement; }
    public void setEducationRequirement(String educationRequirement) { this.educationRequirement = educationRequirement; }
    public java.math.BigDecimal getBudgetedSalaryMin() { return budgetedSalaryMin; }
    public void setBudgetedSalaryMin(java.math.BigDecimal budgetedSalaryMin) { this.budgetedSalaryMin = budgetedSalaryMin; }
    public java.math.BigDecimal getBudgetedSalaryMax() { return budgetedSalaryMax; }
    public void setBudgetedSalaryMax(java.math.BigDecimal budgetedSalaryMax) { this.budgetedSalaryMax = budgetedSalaryMax; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public LocalDate getTargetJoinDate() { return targetJoinDate; }
    public void setTargetJoinDate(LocalDate targetJoinDate) { this.targetJoinDate = targetJoinDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Employee getRequestedBy() { return requestedBy; }
    public void setRequestedBy(Employee requestedBy) { this.requestedBy = requestedBy; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public Employee getApprovedBy() { return approvedBy; }
    public void setApprovedBy(Employee approvedBy) { this.approvedBy = approvedBy; }
    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }
    public String getApproverRemarks() { return approverRemarks; }
    public void setApproverRemarks(String approverRemarks) { this.approverRemarks = approverRemarks; }
    public LocalDateTime getRejectedAt() { return rejectedAt; }
    public void setRejectedAt(LocalDateTime rejectedAt) { this.rejectedAt = rejectedAt; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public Integer getFilledPositions() { return filledPositions; }
    public void setFilledPositions(Integer filledPositions) { this.filledPositions = filledPositions; }
    public LocalDateTime getClosedAt() { return closedAt; }
    public void setClosedAt(LocalDateTime closedAt) { this.closedAt = closedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
}
