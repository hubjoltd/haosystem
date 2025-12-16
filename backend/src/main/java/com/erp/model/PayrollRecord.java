package com.erp.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payroll_records")
public class PayrollRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "payroll_run_id", nullable = false)
    private PayrollRun payrollRun;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne
    @JoinColumn(name = "timesheet_id")
    private Timesheet timesheet;

    @Column(length = 20)
    private String employeeType; // SALARIED, HOURLY

    private BigDecimal annualSalary;

    private BigDecimal hourlyRate;

    private BigDecimal regularHours;

    private BigDecimal overtimeHours;

    private BigDecimal basePay;

    private BigDecimal overtimePay;

    private BigDecimal bonuses;

    private BigDecimal reimbursements;

    private BigDecimal grossPay;

    private BigDecimal preTaxDeductions;

    private BigDecimal healthInsurance;

    private BigDecimal dentalInsurance;

    private BigDecimal visionInsurance;

    private BigDecimal retirement401k;

    private BigDecimal hsaContribution;

    private BigDecimal otherPreTaxDeductions;

    private BigDecimal taxableIncome;

    private BigDecimal federalTax;

    private BigDecimal stateTax;

    private BigDecimal localTax;

    private BigDecimal socialSecurityTax;

    private BigDecimal medicareTax;

    private BigDecimal disabilityTax;

    private BigDecimal totalTaxes;

    private BigDecimal postTaxDeductions;

    private BigDecimal loanDeductions;

    private BigDecimal garnishments;

    private BigDecimal otherPostTaxDeductions;

    private BigDecimal totalDeductions;

    private BigDecimal netPay;

    private BigDecimal employerSocialSecurity;

    private BigDecimal employerMedicare;

    private BigDecimal employerHealthContribution;

    private BigDecimal employer401kMatch;

    private BigDecimal totalEmployerContributions;

    @Column(length = 50)
    private String projectCode; // For project-wise cost allocation

    @Column(length = 50)
    private String costCenterCode;

    @Column(nullable = false, length = 20)
    private String status; // CALCULATED, APPROVED, PROCESSED, CANCELLED

    @Column(length = 500)
    private String remarks;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = "CALCULATED";
        initializeDefaults();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    private void initializeDefaults() {
        if (regularHours == null) regularHours = BigDecimal.ZERO;
        if (overtimeHours == null) overtimeHours = BigDecimal.ZERO;
        if (basePay == null) basePay = BigDecimal.ZERO;
        if (overtimePay == null) overtimePay = BigDecimal.ZERO;
        if (bonuses == null) bonuses = BigDecimal.ZERO;
        if (reimbursements == null) reimbursements = BigDecimal.ZERO;
        if (grossPay == null) grossPay = BigDecimal.ZERO;
        if (preTaxDeductions == null) preTaxDeductions = BigDecimal.ZERO;
        if (totalTaxes == null) totalTaxes = BigDecimal.ZERO;
        if (postTaxDeductions == null) postTaxDeductions = BigDecimal.ZERO;
        if (totalDeductions == null) totalDeductions = BigDecimal.ZERO;
        if (netPay == null) netPay = BigDecimal.ZERO;
        if (totalEmployerContributions == null) totalEmployerContributions = BigDecimal.ZERO;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public PayrollRun getPayrollRun() { return payrollRun; }
    public void setPayrollRun(PayrollRun payrollRun) { this.payrollRun = payrollRun; }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }

    public Timesheet getTimesheet() { return timesheet; }
    public void setTimesheet(Timesheet timesheet) { this.timesheet = timesheet; }

    public String getEmployeeType() { return employeeType; }
    public void setEmployeeType(String employeeType) { this.employeeType = employeeType; }

    public BigDecimal getAnnualSalary() { return annualSalary; }
    public void setAnnualSalary(BigDecimal annualSalary) { this.annualSalary = annualSalary; }

    public BigDecimal getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(BigDecimal hourlyRate) { this.hourlyRate = hourlyRate; }

    public BigDecimal getRegularHours() { return regularHours; }
    public void setRegularHours(BigDecimal regularHours) { this.regularHours = regularHours; }

    public BigDecimal getOvertimeHours() { return overtimeHours; }
    public void setOvertimeHours(BigDecimal overtimeHours) { this.overtimeHours = overtimeHours; }

    public BigDecimal getBasePay() { return basePay; }
    public void setBasePay(BigDecimal basePay) { this.basePay = basePay; }

    public BigDecimal getOvertimePay() { return overtimePay; }
    public void setOvertimePay(BigDecimal overtimePay) { this.overtimePay = overtimePay; }

    public BigDecimal getBonuses() { return bonuses; }
    public void setBonuses(BigDecimal bonuses) { this.bonuses = bonuses; }

    public BigDecimal getReimbursements() { return reimbursements; }
    public void setReimbursements(BigDecimal reimbursements) { this.reimbursements = reimbursements; }

    public BigDecimal getGrossPay() { return grossPay; }
    public void setGrossPay(BigDecimal grossPay) { this.grossPay = grossPay; }

    public BigDecimal getPreTaxDeductions() { return preTaxDeductions; }
    public void setPreTaxDeductions(BigDecimal preTaxDeductions) { this.preTaxDeductions = preTaxDeductions; }

    public BigDecimal getHealthInsurance() { return healthInsurance; }
    public void setHealthInsurance(BigDecimal healthInsurance) { this.healthInsurance = healthInsurance; }

    public BigDecimal getDentalInsurance() { return dentalInsurance; }
    public void setDentalInsurance(BigDecimal dentalInsurance) { this.dentalInsurance = dentalInsurance; }

    public BigDecimal getVisionInsurance() { return visionInsurance; }
    public void setVisionInsurance(BigDecimal visionInsurance) { this.visionInsurance = visionInsurance; }

    public BigDecimal getRetirement401k() { return retirement401k; }
    public void setRetirement401k(BigDecimal retirement401k) { this.retirement401k = retirement401k; }

    public BigDecimal getHsaContribution() { return hsaContribution; }
    public void setHsaContribution(BigDecimal hsaContribution) { this.hsaContribution = hsaContribution; }

    public BigDecimal getOtherPreTaxDeductions() { return otherPreTaxDeductions; }
    public void setOtherPreTaxDeductions(BigDecimal otherPreTaxDeductions) { this.otherPreTaxDeductions = otherPreTaxDeductions; }

    public BigDecimal getTaxableIncome() { return taxableIncome; }
    public void setTaxableIncome(BigDecimal taxableIncome) { this.taxableIncome = taxableIncome; }

    public BigDecimal getFederalTax() { return federalTax; }
    public void setFederalTax(BigDecimal federalTax) { this.federalTax = federalTax; }

    public BigDecimal getStateTax() { return stateTax; }
    public void setStateTax(BigDecimal stateTax) { this.stateTax = stateTax; }

    public BigDecimal getLocalTax() { return localTax; }
    public void setLocalTax(BigDecimal localTax) { this.localTax = localTax; }

    public BigDecimal getSocialSecurityTax() { return socialSecurityTax; }
    public void setSocialSecurityTax(BigDecimal socialSecurityTax) { this.socialSecurityTax = socialSecurityTax; }

    public BigDecimal getMedicareTax() { return medicareTax; }
    public void setMedicareTax(BigDecimal medicareTax) { this.medicareTax = medicareTax; }

    public BigDecimal getDisabilityTax() { return disabilityTax; }
    public void setDisabilityTax(BigDecimal disabilityTax) { this.disabilityTax = disabilityTax; }

    public BigDecimal getTotalTaxes() { return totalTaxes; }
    public void setTotalTaxes(BigDecimal totalTaxes) { this.totalTaxes = totalTaxes; }

    public BigDecimal getPostTaxDeductions() { return postTaxDeductions; }
    public void setPostTaxDeductions(BigDecimal postTaxDeductions) { this.postTaxDeductions = postTaxDeductions; }

    public BigDecimal getLoanDeductions() { return loanDeductions; }
    public void setLoanDeductions(BigDecimal loanDeductions) { this.loanDeductions = loanDeductions; }

    public BigDecimal getGarnishments() { return garnishments; }
    public void setGarnishments(BigDecimal garnishments) { this.garnishments = garnishments; }

    public BigDecimal getOtherPostTaxDeductions() { return otherPostTaxDeductions; }
    public void setOtherPostTaxDeductions(BigDecimal otherPostTaxDeductions) { this.otherPostTaxDeductions = otherPostTaxDeductions; }

    public BigDecimal getTotalDeductions() { return totalDeductions; }
    public void setTotalDeductions(BigDecimal totalDeductions) { this.totalDeductions = totalDeductions; }

    public BigDecimal getNetPay() { return netPay; }
    public void setNetPay(BigDecimal netPay) { this.netPay = netPay; }

    public BigDecimal getEmployerSocialSecurity() { return employerSocialSecurity; }
    public void setEmployerSocialSecurity(BigDecimal employerSocialSecurity) { this.employerSocialSecurity = employerSocialSecurity; }

    public BigDecimal getEmployerMedicare() { return employerMedicare; }
    public void setEmployerMedicare(BigDecimal employerMedicare) { this.employerMedicare = employerMedicare; }

    public BigDecimal getEmployerHealthContribution() { return employerHealthContribution; }
    public void setEmployerHealthContribution(BigDecimal employerHealthContribution) { this.employerHealthContribution = employerHealthContribution; }

    public BigDecimal getEmployer401kMatch() { return employer401kMatch; }
    public void setEmployer401kMatch(BigDecimal employer401kMatch) { this.employer401kMatch = employer401kMatch; }

    public BigDecimal getTotalEmployerContributions() { return totalEmployerContributions; }
    public void setTotalEmployerContributions(BigDecimal totalEmployerContributions) { this.totalEmployerContributions = totalEmployerContributions; }

    public String getProjectCode() { return projectCode; }
    public void setProjectCode(String projectCode) { this.projectCode = projectCode; }

    public String getCostCenterCode() { return costCenterCode; }
    public void setCostCenterCode(String costCenterCode) { this.costCenterCode = costCenterCode; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
