package com.erp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "leave_balances")
public class LeaveBalance {

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
    private Integer year;

    private BigDecimal openingBalance;
    private BigDecimal credited;
    private BigDecimal used;
    private BigDecimal pending;
    private BigDecimal lapsed;
    private BigDecimal carryForward;
    private BigDecimal encashed;

    private LocalDateTime lastAccrualDate;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (openingBalance == null) openingBalance = BigDecimal.ZERO;
        if (credited == null) credited = BigDecimal.ZERO;
        if (used == null) used = BigDecimal.ZERO;
        if (pending == null) pending = BigDecimal.ZERO;
        if (lapsed == null) lapsed = BigDecimal.ZERO;
        if (carryForward == null) carryForward = BigDecimal.ZERO;
        if (encashed == null) encashed = BigDecimal.ZERO;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public BigDecimal getAvailableBalance() {
        BigDecimal open = openingBalance != null ? openingBalance : BigDecimal.ZERO;
        BigDecimal credit = credited != null ? credited : BigDecimal.ZERO;
        BigDecimal carry = carryForward != null ? carryForward : BigDecimal.ZERO;
        BigDecimal usedAmt = used != null ? used : BigDecimal.ZERO;
        BigDecimal pendingAmt = pending != null ? pending : BigDecimal.ZERO;
        BigDecimal lapsedAmt = lapsed != null ? lapsed : BigDecimal.ZERO;
        BigDecimal encashedAmt = encashed != null ? encashed : BigDecimal.ZERO;
        
        return open.add(credit).add(carry)
            .subtract(usedAmt)
            .subtract(pendingAmt)
            .subtract(lapsedAmt)
            .subtract(encashedAmt);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }

    public LeaveType getLeaveType() { return leaveType; }
    public void setLeaveType(LeaveType leaveType) { this.leaveType = leaveType; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public BigDecimal getOpeningBalance() { return openingBalance; }
    public void setOpeningBalance(BigDecimal openingBalance) { this.openingBalance = openingBalance; }

    public BigDecimal getCredited() { return credited; }
    public void setCredited(BigDecimal credited) { this.credited = credited; }

    public BigDecimal getUsed() { return used; }
    public void setUsed(BigDecimal used) { this.used = used; }

    public BigDecimal getPending() { return pending; }
    public void setPending(BigDecimal pending) { this.pending = pending; }

    public BigDecimal getLapsed() { return lapsed; }
    public void setLapsed(BigDecimal lapsed) { this.lapsed = lapsed; }

    public BigDecimal getCarryForward() { return carryForward; }
    public void setCarryForward(BigDecimal carryForward) { this.carryForward = carryForward; }

    public BigDecimal getEncashed() { return encashed; }
    public void setEncashed(BigDecimal encashed) { this.encashed = encashed; }

    public LocalDateTime getLastAccrualDate() { return lastAccrualDate; }
    public void setLastAccrualDate(LocalDateTime lastAccrualDate) { this.lastAccrualDate = lastAccrualDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
