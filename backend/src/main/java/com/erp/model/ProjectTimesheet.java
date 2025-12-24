package com.erp.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_timesheets")
public class ProjectTimesheet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String projectTimesheetNumber;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(length = 50)
    private String projectCode;

    @Column(length = 100)
    private String projectName;

    @Column(nullable = false)
    private LocalDate periodStartDate;

    @Column(nullable = false)
    private LocalDate periodEndDate;

    private BigDecimal totalHours;

    private BigDecimal billableHours;

    private BigDecimal nonBillableHours;

    private BigDecimal regularHours;

    private BigDecimal overtimeHours;

    @Column(length = 20)
    private String status;

    @ManyToOne
    @JoinColumn(name = "approved_by")
    private Employee approvedBy;

    private LocalDateTime approvedAt;

    @Column(length = 500)
    private String remarks;

    @Column(length = 500)
    private String approverRemarks;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = "DRAFT";
        if (totalHours == null) totalHours = BigDecimal.ZERO;
        if (billableHours == null) billableHours = BigDecimal.ZERO;
        if (nonBillableHours == null) nonBillableHours = BigDecimal.ZERO;
        if (regularHours == null) regularHours = BigDecimal.ZERO;
        if (overtimeHours == null) overtimeHours = BigDecimal.ZERO;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProjectTimesheetNumber() { return projectTimesheetNumber; }
    public void setProjectTimesheetNumber(String projectTimesheetNumber) { this.projectTimesheetNumber = projectTimesheetNumber; }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }

    public String getProjectCode() { return projectCode; }
    public void setProjectCode(String projectCode) { this.projectCode = projectCode; }

    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }

    public LocalDate getPeriodStartDate() { return periodStartDate; }
    public void setPeriodStartDate(LocalDate periodStartDate) { this.periodStartDate = periodStartDate; }

    public LocalDate getPeriodEndDate() { return periodEndDate; }
    public void setPeriodEndDate(LocalDate periodEndDate) { this.periodEndDate = periodEndDate; }

    public BigDecimal getTotalHours() { return totalHours; }
    public void setTotalHours(BigDecimal totalHours) { this.totalHours = totalHours; }

    public BigDecimal getBillableHours() { return billableHours; }
    public void setBillableHours(BigDecimal billableHours) { this.billableHours = billableHours; }

    public BigDecimal getNonBillableHours() { return nonBillableHours; }
    public void setNonBillableHours(BigDecimal nonBillableHours) { this.nonBillableHours = nonBillableHours; }

    public BigDecimal getRegularHours() { return regularHours; }
    public void setRegularHours(BigDecimal regularHours) { this.regularHours = regularHours; }

    public BigDecimal getOvertimeHours() { return overtimeHours; }
    public void setOvertimeHours(BigDecimal overtimeHours) { this.overtimeHours = overtimeHours; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Employee getApprovedBy() { return approvedBy; }
    public void setApprovedBy(Employee approvedBy) { this.approvedBy = approvedBy; }

    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public String getApproverRemarks() { return approverRemarks; }
    public void setApproverRemarks(String approverRemarks) { this.approverRemarks = approverRemarks; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
