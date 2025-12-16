package com.erp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pay_frequencies")
public class PayFrequency {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(nullable = false, length = 50)
    private String name; // Weekly, Bi-Weekly, Semi-Monthly, Monthly

    @Column(length = 200)
    private String description;

    private Integer periodsPerYear; // 52, 26, 24, 12

    private Integer payDayOfWeek; // 1-7 for weekly/bi-weekly

    private Integer payDayOfMonth; // 1-31 for monthly/semi-monthly

    private Integer secondPayDayOfMonth; // For semi-monthly (e.g., 15th and last day)

    private Boolean isDefault;

    private Boolean isActive;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isActive == null) isActive = true;
        if (isDefault == null) isDefault = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getPeriodsPerYear() { return periodsPerYear; }
    public void setPeriodsPerYear(Integer periodsPerYear) { this.periodsPerYear = periodsPerYear; }

    public Integer getPayDayOfWeek() { return payDayOfWeek; }
    public void setPayDayOfWeek(Integer payDayOfWeek) { this.payDayOfWeek = payDayOfWeek; }

    public Integer getPayDayOfMonth() { return payDayOfMonth; }
    public void setPayDayOfMonth(Integer payDayOfMonth) { this.payDayOfMonth = payDayOfMonth; }

    public Integer getSecondPayDayOfMonth() { return secondPayDayOfMonth; }
    public void setSecondPayDayOfMonth(Integer secondPayDayOfMonth) { this.secondPayDayOfMonth = secondPayDayOfMonth; }

    public Boolean getIsDefault() { return isDefault; }
    public void setIsDefault(Boolean isDefault) { this.isDefault = isDefault; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
