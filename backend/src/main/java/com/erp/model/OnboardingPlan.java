package com.erp.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "onboarding_plans")
public class OnboardingPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 30)
    private String planNumber;
    
    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;
    
    private LocalDate startDate;
    private LocalDate targetCompletionDate;
    private LocalDate actualCompletionDate;
    
    @ManyToOne
    @JoinColumn(name = "buddy_id")
    private Employee buddy;
    
    @ManyToOne
    @JoinColumn(name = "manager_id")
    private Employee manager;
    
    @ManyToOne
    @JoinColumn(name = "hr_coordinator_id")
    private Employee hrCoordinator;
    
    @Column(nullable = false, length = 30)
    private String status = "PENDING";
    
    private Integer totalTasks = 0;
    private Integer completedTasks = 0;
    private Integer progressPercentage = 0;
    
    @Column(columnDefinition = "TEXT")
    private String welcomeMessage;
    
    private Boolean welcomeEmailSent = false;
    private LocalDateTime welcomeEmailSentAt;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @OneToMany(mappedBy = "onboardingPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OnboardingTask> tasks = new ArrayList<>();
    
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
    public String getPlanNumber() { return planNumber; }
    public void setPlanNumber(String planNumber) { this.planNumber = planNumber; }
    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getTargetCompletionDate() { return targetCompletionDate; }
    public void setTargetCompletionDate(LocalDate targetCompletionDate) { this.targetCompletionDate = targetCompletionDate; }
    public LocalDate getActualCompletionDate() { return actualCompletionDate; }
    public void setActualCompletionDate(LocalDate actualCompletionDate) { this.actualCompletionDate = actualCompletionDate; }
    public Employee getBuddy() { return buddy; }
    public void setBuddy(Employee buddy) { this.buddy = buddy; }
    public Employee getManager() { return manager; }
    public void setManager(Employee manager) { this.manager = manager; }
    public Employee getHrCoordinator() { return hrCoordinator; }
    public void setHrCoordinator(Employee hrCoordinator) { this.hrCoordinator = hrCoordinator; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getTotalTasks() { return totalTasks; }
    public void setTotalTasks(Integer totalTasks) { this.totalTasks = totalTasks; }
    public Integer getCompletedTasks() { return completedTasks; }
    public void setCompletedTasks(Integer completedTasks) { this.completedTasks = completedTasks; }
    public Integer getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Integer progressPercentage) { this.progressPercentage = progressPercentage; }
    public String getWelcomeMessage() { return welcomeMessage; }
    public void setWelcomeMessage(String welcomeMessage) { this.welcomeMessage = welcomeMessage; }
    public Boolean getWelcomeEmailSent() { return welcomeEmailSent; }
    public void setWelcomeEmailSent(Boolean welcomeEmailSent) { this.welcomeEmailSent = welcomeEmailSent; }
    public LocalDateTime getWelcomeEmailSentAt() { return welcomeEmailSentAt; }
    public void setWelcomeEmailSentAt(LocalDateTime welcomeEmailSentAt) { this.welcomeEmailSentAt = welcomeEmailSentAt; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public List<OnboardingTask> getTasks() { return tasks; }
    public void setTasks(List<OnboardingTask> tasks) { this.tasks = tasks; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
