package com.erp.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "timesheets")
public class Timesheet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String timesheetNumber;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "reportingManager"})
    private Employee employee;

    @ManyToOne
    @JoinColumn(name = "pay_frequency_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private PayFrequency payFrequency;

    @Column(nullable = false)
    private LocalDate periodStartDate;

    @Column(nullable = false)
    private LocalDate periodEndDate;

    private BigDecimal totalRegularHours;

    private BigDecimal totalOvertimeHours;

    private BigDecimal totalHours;

    private Integer workingDays;

    private Integer presentDays;

    private Integer absentDays;

    private Integer leaveDays;

    private Integer holidayDays;

    @Column(nullable = false, length = 20)
    private String status; // DRAFT, PENDING_APPROVAL, APPROVED, REJECTED

    @ManyToOne
    @JoinColumn(name = "approved_by")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "reportingManager"})
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
        if (totalRegularHours == null) totalRegularHours = BigDecimal.ZERO;
        if (totalOvertimeHours == null) totalOvertimeHours = BigDecimal.ZERO;
        if (totalHours == null) totalHours = BigDecimal.ZERO;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTimesheetNumber() { return timesheetNumber; }
    public void setTimesheetNumber(String timesheetNumber) { this.timesheetNumber = timesheetNumber; }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }

    public PayFrequency getPayFrequency() { return payFrequency; }
    public void setPayFrequency(PayFrequency payFrequency) { this.payFrequency = payFrequency; }

    public LocalDate getPeriodStartDate() { return periodStartDate; }
    public void setPeriodStartDate(LocalDate periodStartDate) { this.periodStartDate = periodStartDate; }

    public LocalDate getPeriodEndDate() { return periodEndDate; }
    public void setPeriodEndDate(LocalDate periodEndDate) { this.periodEndDate = periodEndDate; }

    public BigDecimal getTotalRegularHours() { return totalRegularHours; }
    public void setTotalRegularHours(BigDecimal totalRegularHours) { this.totalRegularHours = totalRegularHours; }

    public BigDecimal getTotalOvertimeHours() { return totalOvertimeHours; }
    public void setTotalOvertimeHours(BigDecimal totalOvertimeHours) { this.totalOvertimeHours = totalOvertimeHours; }

    public BigDecimal getTotalHours() { return totalHours; }
    public void setTotalHours(BigDecimal totalHours) { this.totalHours = totalHours; }

    public Integer getWorkingDays() { return workingDays; }
    public void setWorkingDays(Integer workingDays) { this.workingDays = workingDays; }

    public Integer getPresentDays() { return presentDays; }
    public void setPresentDays(Integer presentDays) { this.presentDays = presentDays; }

    public Integer getAbsentDays() { return absentDays; }
    public void setAbsentDays(Integer absentDays) { this.absentDays = absentDays; }

    public Integer getLeaveDays() { return leaveDays; }
    public void setLeaveDays(Integer leaveDays) { this.leaveDays = leaveDays; }

    public Integer getHolidayDays() { return holidayDays; }
    public void setHolidayDays(Integer holidayDays) { this.holidayDays = holidayDays; }

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
