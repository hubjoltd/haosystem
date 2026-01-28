package com.erp.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.math.BigDecimal;

@Entity
@Table(name = "leave_requests")
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne
    @JoinColumn(name = "leave_type_id", nullable = false)
    private LeaveType leaveType;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    private BigDecimal totalDays;

    @Column(length = 20)
    private String dayType; // FULL_DAY, HALF_DAY_AM, HALF_DAY_PM

    // Hourly leave support
    private LocalTime startTime; // For hourly leave requests
    private LocalTime endTime; // For hourly leave requests
    private BigDecimal totalHours; // Hours requested for hourly leave
    private Boolean isHourlyLeave; // Whether this is an hourly leave request

    @Column(length = 1000)
    private String reason;

    @Column(length = 20)
    private String status; // PENDING, APPROVED, REJECTED, CANCELLED

    @ManyToOne
    @JoinColumn(name = "approved_by")
    private Employee approvedBy;

    private LocalDateTime approvedAt;

    @Column(length = 500)
    private String approverRemarks;

    private String attachmentUrl;

    @Column(length = 100)
    private String emergencyContact;

    private Boolean notifyManager;

    @Column(length = 20)
    private String managerApprovalStatus;
    
    @ManyToOne
    @JoinColumn(name = "manager_approved_by")
    private Employee managerApprovedBy;
    
    private LocalDateTime managerApprovedAt;
    
    @Column(length = 500)
    private String managerRemarks;
    
    @Column(length = 20)
    private String hrApprovalStatus;
    
    @ManyToOne
    @JoinColumn(name = "hr_approved_by")
    private Employee hrApprovedBy;
    
    private LocalDateTime hrApprovedAt;
    
    @Column(length = 500)
    private String hrRemarks;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = "PENDING";
        if (dayType == null) dayType = "FULL_DAY";
        if (notifyManager == null) notifyManager = true;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }

    public LeaveType getLeaveType() { return leaveType; }
    public void setLeaveType(LeaveType leaveType) { this.leaveType = leaveType; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public BigDecimal getTotalDays() { return totalDays; }
    public void setTotalDays(BigDecimal totalDays) { this.totalDays = totalDays; }

    public String getDayType() { return dayType; }
    public void setDayType(String dayType) { this.dayType = dayType; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Employee getApprovedBy() { return approvedBy; }
    public void setApprovedBy(Employee approvedBy) { this.approvedBy = approvedBy; }

    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }

    public String getApproverRemarks() { return approverRemarks; }
    public void setApproverRemarks(String approverRemarks) { this.approverRemarks = approverRemarks; }

    public String getAttachmentUrl() { return attachmentUrl; }
    public void setAttachmentUrl(String attachmentUrl) { this.attachmentUrl = attachmentUrl; }

    public String getEmergencyContact() { return emergencyContact; }
    public void setEmergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; }

    public Boolean getNotifyManager() { return notifyManager; }
    public void setNotifyManager(Boolean notifyManager) { this.notifyManager = notifyManager; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public BigDecimal getTotalHours() { return totalHours; }
    public void setTotalHours(BigDecimal totalHours) { this.totalHours = totalHours; }

    public Boolean getIsHourlyLeave() { return isHourlyLeave; }
    public void setIsHourlyLeave(Boolean isHourlyLeave) { this.isHourlyLeave = isHourlyLeave; }

    public String getManagerApprovalStatus() { return managerApprovalStatus; }
    public void setManagerApprovalStatus(String managerApprovalStatus) { this.managerApprovalStatus = managerApprovalStatus; }

    public Employee getManagerApprovedBy() { return managerApprovedBy; }
    public void setManagerApprovedBy(Employee managerApprovedBy) { this.managerApprovedBy = managerApprovedBy; }

    public LocalDateTime getManagerApprovedAt() { return managerApprovedAt; }
    public void setManagerApprovedAt(LocalDateTime managerApprovedAt) { this.managerApprovedAt = managerApprovedAt; }

    public String getManagerRemarks() { return managerRemarks; }
    public void setManagerRemarks(String managerRemarks) { this.managerRemarks = managerRemarks; }

    public String getHrApprovalStatus() { return hrApprovalStatus; }
    public void setHrApprovalStatus(String hrApprovalStatus) { this.hrApprovalStatus = hrApprovalStatus; }

    public Employee getHrApprovedBy() { return hrApprovedBy; }
    public void setHrApprovedBy(Employee hrApprovedBy) { this.hrApprovedBy = hrApprovedBy; }

    public LocalDateTime getHrApprovedAt() { return hrApprovedAt; }
    public void setHrApprovedAt(LocalDateTime hrApprovedAt) { this.hrApprovedAt = hrApprovedAt; }

    public String getHrRemarks() { return hrRemarks; }
    public void setHrRemarks(String hrRemarks) { this.hrRemarks = hrRemarks; }
}
