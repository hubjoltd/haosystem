package com.erp.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "onboarding_tasks")
public class OnboardingTask {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "onboarding_plan_id", nullable = false)
    private OnboardingPlan onboardingPlan;
    
    @Column(nullable = false, length = 200)
    private String taskName;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(length = 50)
    private String category;
    
    private Integer sortOrder = 0;
    
    private Boolean isMandatory = true;
    
    private LocalDate dueDate;
    
    @ManyToOne
    @JoinColumn(name = "assigned_to_id")
    private Employee assignedTo;
    
    @Column(length = 30)
    private String assigneeRole;
    
    @Column(nullable = false, length = 30)
    private String status = "PENDING";
    
    private LocalDateTime completedAt;
    
    @ManyToOne
    @JoinColumn(name = "completed_by_id")
    private Employee completedBy;
    
    @Column(columnDefinition = "TEXT")
    private String completionNotes;
    
    @Column(length = 500)
    private String attachmentUrl;
    
    private Boolean requiresSignature = false;
    private Boolean signatureObtained = false;
    private LocalDateTime signedAt;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
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
    public OnboardingPlan getOnboardingPlan() { return onboardingPlan; }
    public void setOnboardingPlan(OnboardingPlan onboardingPlan) { this.onboardingPlan = onboardingPlan; }
    public String getTaskName() { return taskName; }
    public void setTaskName(String taskName) { this.taskName = taskName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    public Boolean getIsMandatory() { return isMandatory; }
    public void setIsMandatory(Boolean isMandatory) { this.isMandatory = isMandatory; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public Employee getAssignedTo() { return assignedTo; }
    public void setAssignedTo(Employee assignedTo) { this.assignedTo = assignedTo; }
    public String getAssigneeRole() { return assigneeRole; }
    public void setAssigneeRole(String assigneeRole) { this.assigneeRole = assigneeRole; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    public Employee getCompletedBy() { return completedBy; }
    public void setCompletedBy(Employee completedBy) { this.completedBy = completedBy; }
    public String getCompletionNotes() { return completionNotes; }
    public void setCompletionNotes(String completionNotes) { this.completionNotes = completionNotes; }
    public String getAttachmentUrl() { return attachmentUrl; }
    public void setAttachmentUrl(String attachmentUrl) { this.attachmentUrl = attachmentUrl; }
    public Boolean getRequiresSignature() { return requiresSignature; }
    public void setRequiresSignature(Boolean requiresSignature) { this.requiresSignature = requiresSignature; }
    public Boolean getSignatureObtained() { return signatureObtained; }
    public void setSignatureObtained(Boolean signatureObtained) { this.signatureObtained = signatureObtained; }
    public LocalDateTime getSignedAt() { return signedAt; }
    public void setSignedAt(LocalDateTime signedAt) { this.signedAt = signedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
