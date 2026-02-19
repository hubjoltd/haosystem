package com.erp.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String projectCode;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 2000)
    private String description;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(length = 30)
    private String billingType;

    @Column(length = 30)
    private String status;

    private Integer progress;

    private LocalDate startDate;

    private LocalDate endDate;

    private LocalDate deadline;

    private LocalDate completionDate;

    private BigDecimal estimatedHours;

    private BigDecimal estimatedCost;

    private BigDecimal fixedRateAmount;

    private BigDecimal hourlyRate;

    @Column(length = 10)
    private String currency;

    private BigDecimal totalLoggedTime;

    private BigDecimal totalBillableTime;

    private BigDecimal projectCost;

    @ManyToOne
    @JoinColumn(name = "project_manager_id")
    private Employee projectManager;

    private Boolean allowCustomerViewProject;
    private Boolean allowCustomerViewTasks;
    private Boolean allowCustomerCommentTasks;
    private Boolean allowCustomerViewTaskComments;
    private Boolean allowCustomerViewTimesheets;
    private Boolean allowCustomerViewFiles;
    private Boolean allowCustomerUploadFiles;
    private Boolean allowCustomerViewDiscussions;

    @Column(length = 20)
    private String calculatedProgress;

    private Boolean billableTasks;
    private Boolean invoiceProject;
    private Boolean invoiceTasks;
    private Boolean invoiceTimesheets;

    @Column(length = 500)
    private String tags;

    private Boolean locationTrackingEnabled;
    private Double locationLatitude;
    private Double locationLongitude;
    private Integer locationRadiusMeters;

    @Column(length = 500)
    private String locationAddress;

    private Boolean archived;
    private Boolean deleted;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Column(length = 100)
    private String createdBy;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ProjectMember> members = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ProjectTask> tasks = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ProjectMilestone> milestones = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = "NOT_STARTED";
        if (progress == null) progress = 0;
        if (currency == null) currency = "USD";
        if (billingType == null) billingType = "FIXED_RATE";
        if (totalLoggedTime == null) totalLoggedTime = BigDecimal.ZERO;
        if (totalBillableTime == null) totalBillableTime = BigDecimal.ZERO;
        if (locationTrackingEnabled == null) locationTrackingEnabled = false;
        if (locationRadiusMeters == null) locationRadiusMeters = 100;
        if (archived == null) archived = false;
        if (deleted == null) deleted = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProjectCode() { return projectCode; }
    public void setProjectCode(String projectCode) { this.projectCode = projectCode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }

    public String getBillingType() { return billingType; }
    public void setBillingType(String billingType) { this.billingType = billingType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getProgress() { return progress; }
    public void setProgress(Integer progress) { this.progress = progress; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }

    public LocalDate getCompletionDate() { return completionDate; }
    public void setCompletionDate(LocalDate completionDate) { this.completionDate = completionDate; }

    public BigDecimal getEstimatedHours() { return estimatedHours; }
    public void setEstimatedHours(BigDecimal estimatedHours) { this.estimatedHours = estimatedHours; }

    public BigDecimal getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(BigDecimal estimatedCost) { this.estimatedCost = estimatedCost; }

    public BigDecimal getFixedRateAmount() { return fixedRateAmount; }
    public void setFixedRateAmount(BigDecimal fixedRateAmount) { this.fixedRateAmount = fixedRateAmount; }

    public BigDecimal getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(BigDecimal hourlyRate) { this.hourlyRate = hourlyRate; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public BigDecimal getTotalLoggedTime() { return totalLoggedTime; }
    public void setTotalLoggedTime(BigDecimal totalLoggedTime) { this.totalLoggedTime = totalLoggedTime; }

    public BigDecimal getTotalBillableTime() { return totalBillableTime; }
    public void setTotalBillableTime(BigDecimal totalBillableTime) { this.totalBillableTime = totalBillableTime; }

    public BigDecimal getProjectCost() { return projectCost; }
    public void setProjectCost(BigDecimal projectCost) { this.projectCost = projectCost; }

    public Employee getProjectManager() { return projectManager; }
    public void setProjectManager(Employee projectManager) { this.projectManager = projectManager; }

    public Boolean getAllowCustomerViewProject() { return allowCustomerViewProject; }
    public void setAllowCustomerViewProject(Boolean allowCustomerViewProject) { this.allowCustomerViewProject = allowCustomerViewProject; }

    public Boolean getAllowCustomerViewTasks() { return allowCustomerViewTasks; }
    public void setAllowCustomerViewTasks(Boolean allowCustomerViewTasks) { this.allowCustomerViewTasks = allowCustomerViewTasks; }

    public Boolean getAllowCustomerCommentTasks() { return allowCustomerCommentTasks; }
    public void setAllowCustomerCommentTasks(Boolean allowCustomerCommentTasks) { this.allowCustomerCommentTasks = allowCustomerCommentTasks; }

    public Boolean getAllowCustomerViewTaskComments() { return allowCustomerViewTaskComments; }
    public void setAllowCustomerViewTaskComments(Boolean allowCustomerViewTaskComments) { this.allowCustomerViewTaskComments = allowCustomerViewTaskComments; }

    public Boolean getAllowCustomerViewTimesheets() { return allowCustomerViewTimesheets; }
    public void setAllowCustomerViewTimesheets(Boolean allowCustomerViewTimesheets) { this.allowCustomerViewTimesheets = allowCustomerViewTimesheets; }

    public Boolean getAllowCustomerViewFiles() { return allowCustomerViewFiles; }
    public void setAllowCustomerViewFiles(Boolean allowCustomerViewFiles) { this.allowCustomerViewFiles = allowCustomerViewFiles; }

    public Boolean getAllowCustomerUploadFiles() { return allowCustomerUploadFiles; }
    public void setAllowCustomerUploadFiles(Boolean allowCustomerUploadFiles) { this.allowCustomerUploadFiles = allowCustomerUploadFiles; }

    public Boolean getAllowCustomerViewDiscussions() { return allowCustomerViewDiscussions; }
    public void setAllowCustomerViewDiscussions(Boolean allowCustomerViewDiscussions) { this.allowCustomerViewDiscussions = allowCustomerViewDiscussions; }

    public String getCalculatedProgress() { return calculatedProgress; }
    public void setCalculatedProgress(String calculatedProgress) { this.calculatedProgress = calculatedProgress; }

    public Boolean getBillableTasks() { return billableTasks; }
    public void setBillableTasks(Boolean billableTasks) { this.billableTasks = billableTasks; }

    public Boolean getInvoiceProject() { return invoiceProject; }
    public void setInvoiceProject(Boolean invoiceProject) { this.invoiceProject = invoiceProject; }

    public Boolean getInvoiceTasks() { return invoiceTasks; }
    public void setInvoiceTasks(Boolean invoiceTasks) { this.invoiceTasks = invoiceTasks; }

    public Boolean getInvoiceTimesheets() { return invoiceTimesheets; }
    public void setInvoiceTimesheets(Boolean invoiceTimesheets) { this.invoiceTimesheets = invoiceTimesheets; }

    public Boolean getLocationTrackingEnabled() { return locationTrackingEnabled; }
    public void setLocationTrackingEnabled(Boolean locationTrackingEnabled) { this.locationTrackingEnabled = locationTrackingEnabled; }

    public Double getLocationLatitude() { return locationLatitude; }
    public void setLocationLatitude(Double locationLatitude) { this.locationLatitude = locationLatitude; }

    public Double getLocationLongitude() { return locationLongitude; }
    public void setLocationLongitude(Double locationLongitude) { this.locationLongitude = locationLongitude; }

    public Integer getLocationRadiusMeters() { return locationRadiusMeters; }
    public void setLocationRadiusMeters(Integer locationRadiusMeters) { this.locationRadiusMeters = locationRadiusMeters; }

    public String getLocationAddress() { return locationAddress; }
    public void setLocationAddress(String locationAddress) { this.locationAddress = locationAddress; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public Boolean getArchived() { return archived; }
    public void setArchived(Boolean archived) { this.archived = archived; }

    public Boolean getDeleted() { return deleted; }
    public void setDeleted(Boolean deleted) { this.deleted = deleted; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public List<ProjectMember> getMembers() { return members; }
    public void setMembers(List<ProjectMember> members) { this.members = members; }

    public List<ProjectTask> getTasks() { return tasks; }
    public void setTasks(List<ProjectTask> tasks) { this.tasks = tasks; }

    public List<ProjectMilestone> getMilestones() { return milestones; }
    public void setMilestones(List<ProjectMilestone> milestones) { this.milestones = milestones; }
}
