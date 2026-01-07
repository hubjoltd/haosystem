package com.erp.service;

import com.erp.model.*;
import com.erp.repository.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class PayrollCalculationService {

    private static final BigDecimal HOURS_PER_YEAR = new BigDecimal("2080");
    private static final BigDecimal SOCIAL_SECURITY_RATE = new BigDecimal("0.062");
    private static final BigDecimal MEDICARE_RATE = new BigDecimal("0.0145");
    private static final BigDecimal DISABILITY_RATE = new BigDecimal("0.009");
    private static final BigDecimal SOCIAL_SECURITY_WAGE_BASE = new BigDecimal("168600"); // 2024

    @Autowired
    private PayrollRunRepository payrollRunRepository;

    @Autowired
    private PayrollRecordRepository payrollRecordRepository;

    @Autowired
    private TimesheetRepository timesheetRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmployeeBenefitRepository employeeBenefitRepository;

    @Autowired
    private AttendanceRecordRepository attendanceRecordRepository;

    @Autowired
    private OvertimeRuleRepository overtimeRuleRepository;

    @Autowired
    private TaxRuleRepository taxRuleRepository;

    @Autowired
    private PayFrequencyRepository payFrequencyRepository;

    @Transactional
    public List<Timesheet> generateTimesheets(LocalDate startDate, LocalDate endDate) {
        List<Employee> employees = employeeRepository.findByActiveTrue();
        List<Timesheet> timesheets = new ArrayList<>();
        
        for (Employee employee : employees) {
            Optional<Timesheet> existing = timesheetRepository.findByEmployeeIdAndPeriodStartDateAndPeriodEndDate(
                employee.getId(), startDate, endDate);
            
            if (existing.isEmpty()) {
                Timesheet timesheet = new Timesheet();
                timesheet.setEmployee(employee);
                timesheet.setTimesheetNumber(generateTimesheetNumber());
                timesheet.setPeriodStartDate(startDate);
                timesheet.setPeriodEndDate(endDate);
                
                calculateTimesheetFromAttendance(timesheet);
                
                timesheets.add(timesheetRepository.save(timesheet));
            }
        }
        
        return timesheets;
    }

    private void calculateTimesheetFromAttendance(Timesheet timesheet) {
        List<AttendanceRecord> records = attendanceRecordRepository
            .findByEmployeeIdAndAttendanceDateBetween(
                timesheet.getEmployee().getId(),
                timesheet.getPeriodStartDate(),
                timesheet.getPeriodEndDate()
            );
        
        BigDecimal totalRegular = BigDecimal.ZERO;
        BigDecimal totalOT = BigDecimal.ZERO;
        int present = 0, absent = 0, leave = 0, holiday = 0;
        
        for (AttendanceRecord record : records) {
            if (record.getRegularHours() != null) {
                totalRegular = totalRegular.add(record.getRegularHours());
            }
            if (record.getOvertimeHours() != null) {
                totalOT = totalOT.add(record.getOvertimeHours());
            }
            
            if ("PRESENT".equals(record.getStatus())) present++;
            else if ("ABSENT".equals(record.getStatus())) absent++;
            else if ("ON_LEAVE".equals(record.getStatus())) leave++;
            else if ("HOLIDAY".equals(record.getStatus())) holiday++;
        }
        
        timesheet.setTotalRegularHours(totalRegular);
        timesheet.setTotalOvertimeHours(totalOT);
        timesheet.setTotalHours(totalRegular.add(totalOT));
        timesheet.setPresentDays(present);
        timesheet.setAbsentDays(absent);
        timesheet.setLeaveDays(leave);
        timesheet.setHolidayDays(holiday);
        timesheet.setStatus("PENDING_APPROVAL");
    }

    @Transactional
    public PayrollRun calculatePayroll(PayrollRun run) {
        run.setStatus("CALCULATING");
        payrollRunRepository.save(run);
        
        List<Timesheet> approvedTimesheets = timesheetRepository.findApprovedTimesheetsByPeriod(
            run.getPeriodStartDate(), run.getPeriodEndDate());
        
        if (approvedTimesheets.isEmpty()) {
            List<Employee> employees = employeeRepository.findByActiveTrue();
            for (Employee employee : employees) {
                PayrollRecord record = calculateEmployeePayroll(run, employee, null);
                payrollRecordRepository.save(record);
            }
        } else {
            for (Timesheet timesheet : approvedTimesheets) {
                PayrollRecord record = calculateEmployeePayroll(run, timesheet.getEmployee(), timesheet);
                payrollRecordRepository.save(record);
            }
        }
        
        aggregatePayrollTotals(run);
        
        run.setStatus("CALCULATED");
        return payrollRunRepository.save(run);
    }

    private PayrollRecord calculateEmployeePayroll(PayrollRun run, Employee employee, Timesheet timesheet) {
        PayrollRecord record = new PayrollRecord();
        record.setPayrollRun(run);
        record.setEmployee(employee);
        record.setTimesheet(timesheet);
        
        String employeeType = employee.getEmploymentType() != null ? employee.getEmploymentType() : "SALARIED";
        record.setEmployeeType(employeeType);
        
        BigDecimal annualSalary = employee.getSalary() != null ? employee.getSalary() : BigDecimal.ZERO;
        record.setAnnualSalary(annualSalary);
        
        BigDecimal hourlyRate;
        if ("HOURLY".equalsIgnoreCase(employeeType) && employee.getHourlyRate() != null && employee.getHourlyRate().compareTo(BigDecimal.ZERO) > 0) {
            hourlyRate = employee.getHourlyRate();
        } else {
            hourlyRate = calculateHourlyRate(annualSalary);
        }
        record.setHourlyRate(hourlyRate);
        
        BigDecimal regularHours = timesheet != null ? timesheet.getTotalRegularHours() : BigDecimal.ZERO;
        BigDecimal overtimeHours = timesheet != null ? timesheet.getTotalOvertimeHours() : BigDecimal.ZERO;
        record.setRegularHours(regularHours);
        record.setOvertimeHours(overtimeHours);
        
        int periodsPerYear = getPeriodsPerYear(run.getPayFrequency());
        
        // Always calculate base pay based on hours worked × hourly rate
        BigDecimal basePay = regularHours.multiply(hourlyRate).setScale(2, RoundingMode.HALF_UP);
        record.setBasePay(basePay);
        
        BigDecimal otMultiplier = getOvertimeMultiplier();
        BigDecimal overtimePay = overtimeHours.multiply(hourlyRate).multiply(otMultiplier);
        record.setOvertimePay(overtimePay);
        
        record.setBonuses(BigDecimal.ZERO);
        record.setReimbursements(BigDecimal.ZERO);
        
        BigDecimal grossPay = basePay.add(overtimePay).add(record.getBonuses()).add(record.getReimbursements());
        record.setGrossPay(grossPay);
        
        calculatePreTaxDeductions(record, employee);
        
        BigDecimal taxableIncome = grossPay.subtract(record.getPreTaxDeductions());
        record.setTaxableIncome(taxableIncome);
        
        calculateTaxes(record, taxableIncome, annualSalary);
        
        calculatePostTaxDeductions(record);
        
        BigDecimal totalDeductions = record.getPreTaxDeductions()
            .add(record.getTotalTaxes())
            .add(record.getPostTaxDeductions());
        record.setTotalDeductions(totalDeductions);
        
        BigDecimal netPay = grossPay.subtract(totalDeductions);
        record.setNetPay(netPay);
        
        calculateEmployerContributions(record);
        
        return record;
    }

    private BigDecimal calculateHourlyRate(BigDecimal annualSalary) {
        if (annualSalary == null || annualSalary.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return annualSalary.divide(HOURS_PER_YEAR, 2, RoundingMode.HALF_UP);
    }

    private int getPeriodsPerYear(PayFrequency frequency) {
        if (frequency != null && frequency.getPeriodsPerYear() != null) {
            return frequency.getPeriodsPerYear();
        }
        return 12; // Default to monthly
    }

    private BigDecimal getOvertimeMultiplier() {
        List<OvertimeRule> rules = overtimeRuleRepository.findByIsActiveTrueOrderByPriorityAsc();
        if (!rules.isEmpty()) {
            return rules.get(0).getMultiplier();
        }
        return new BigDecimal("1.5");
    }

    private void calculatePreTaxDeductions(PayrollRecord record, Employee employee) {
        List<EmployeeBenefit> benefits = employeeBenefitRepository.findByEmployeeIdAndIsPreTaxTrueAndIsActiveTrue(employee.getId());
        
        BigDecimal health = BigDecimal.ZERO;
        BigDecimal dental = BigDecimal.ZERO;
        BigDecimal vision = BigDecimal.ZERO;
        BigDecimal retirement = BigDecimal.ZERO;
        BigDecimal hsa = BigDecimal.ZERO;
        BigDecimal other = BigDecimal.ZERO;
        
        for (EmployeeBenefit benefit : benefits) {
            BigDecimal contribution = benefit.getEmployeeContribution() != null ? benefit.getEmployeeContribution() : BigDecimal.ZERO;
            
            switch (benefit.getBenefitType()) {
                case "HEALTH":
                    health = health.add(contribution);
                    break;
                case "DENTAL":
                    dental = dental.add(contribution);
                    break;
                case "VISION":
                    vision = vision.add(contribution);
                    break;
                case "401K":
                    retirement = retirement.add(contribution);
                    break;
                case "HSA":
                    hsa = hsa.add(contribution);
                    break;
                default:
                    other = other.add(contribution);
            }
        }
        
        record.setHealthInsurance(health);
        record.setDentalInsurance(dental);
        record.setVisionInsurance(vision);
        record.setRetirement401k(retirement);
        record.setHsaContribution(hsa);
        record.setOtherPreTaxDeductions(other);
        
        BigDecimal totalPreTax = health.add(dental).add(vision).add(retirement).add(hsa).add(other);
        record.setPreTaxDeductions(totalPreTax);
    }

    private void calculateTaxes(PayrollRecord record, BigDecimal taxableIncome, BigDecimal annualSalary) {
        BigDecimal federalTax = calculateFederalTax(taxableIncome, annualSalary);
        BigDecimal stateTax = calculateStateTax(taxableIncome);
        BigDecimal localTax = BigDecimal.ZERO;
        
        BigDecimal ssTax = taxableIncome.multiply(SOCIAL_SECURITY_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal medicareTax = taxableIncome.multiply(MEDICARE_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal disabilityTax = taxableIncome.multiply(DISABILITY_RATE).setScale(2, RoundingMode.HALF_UP);
        
        record.setFederalTax(federalTax);
        record.setStateTax(stateTax);
        record.setLocalTax(localTax);
        record.setSocialSecurityTax(ssTax);
        record.setMedicareTax(medicareTax);
        record.setDisabilityTax(disabilityTax);
        
        BigDecimal totalTaxes = federalTax.add(stateTax).add(localTax).add(ssTax).add(medicareTax).add(disabilityTax);
        record.setTotalTaxes(totalTaxes);
    }

    private BigDecimal calculateFederalTax(BigDecimal taxableIncome, BigDecimal annualSalary) {
        List<TaxRule> federalRules = taxRuleRepository.findByTaxTypeAndIsActiveTrue("FEDERAL");
        
        if (!federalRules.isEmpty()) {
            TaxRule rule = federalRules.get(0);
            if (rule.getRate() != null) {
                return taxableIncome.multiply(rule.getRate().divide(BigDecimal.valueOf(100))).setScale(2, RoundingMode.HALF_UP);
            }
        }
        
        return taxableIncome.multiply(new BigDecimal("0.22")).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateStateTax(BigDecimal taxableIncome) {
        List<TaxRule> stateRules = taxRuleRepository.findByTaxTypeAndIsActiveTrue("STATE");
        
        if (!stateRules.isEmpty()) {
            TaxRule rule = stateRules.get(0);
            if (rule.getRate() != null) {
                return taxableIncome.multiply(rule.getRate().divide(BigDecimal.valueOf(100))).setScale(2, RoundingMode.HALF_UP);
            }
        }
        
        return taxableIncome.multiply(new BigDecimal("0.05")).setScale(2, RoundingMode.HALF_UP);
    }

    private void calculatePostTaxDeductions(PayrollRecord record) {
        record.setLoanDeductions(BigDecimal.ZERO);
        record.setGarnishments(BigDecimal.ZERO);
        record.setOtherPostTaxDeductions(BigDecimal.ZERO);
        
        BigDecimal totalPostTax = record.getLoanDeductions()
            .add(record.getGarnishments())
            .add(record.getOtherPostTaxDeductions());
        record.setPostTaxDeductions(totalPostTax);
    }

    private void calculateEmployerContributions(PayrollRecord record) {
        BigDecimal taxableIncome = record.getTaxableIncome();
        
        BigDecimal employerSS = taxableIncome.multiply(SOCIAL_SECURITY_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal employerMedicare = taxableIncome.multiply(MEDICARE_RATE).setScale(2, RoundingMode.HALF_UP);
        
        List<EmployeeBenefit> benefits = employeeBenefitRepository.findByEmployeeIdAndIsActiveTrue(record.getEmployee().getId());
        BigDecimal employerHealth = BigDecimal.ZERO;
        BigDecimal employer401kMatch = BigDecimal.ZERO;
        
        for (EmployeeBenefit benefit : benefits) {
            if (benefit.getEmployerContribution() != null) {
                if ("HEALTH".equals(benefit.getBenefitType())) {
                    employerHealth = employerHealth.add(benefit.getEmployerContribution());
                } else if ("401K".equals(benefit.getBenefitType())) {
                    employer401kMatch = employer401kMatch.add(benefit.getEmployerContribution());
                }
            }
        }
        
        record.setEmployerSocialSecurity(employerSS);
        record.setEmployerMedicare(employerMedicare);
        record.setEmployerHealthContribution(employerHealth);
        record.setEmployer401kMatch(employer401kMatch);
        
        BigDecimal totalEmployerContrib = employerSS.add(employerMedicare).add(employerHealth).add(employer401kMatch);
        record.setTotalEmployerContributions(totalEmployerContrib);
    }

    private void aggregatePayrollTotals(PayrollRun run) {
        List<PayrollRecord> records = payrollRecordRepository.findByPayrollRunId(run.getId());
        
        BigDecimal totalGross = BigDecimal.ZERO;
        BigDecimal totalDeductions = BigDecimal.ZERO;
        BigDecimal totalTaxes = BigDecimal.ZERO;
        BigDecimal totalNet = BigDecimal.ZERO;
        BigDecimal totalEmployerContrib = BigDecimal.ZERO;
        
        for (PayrollRecord record : records) {
            totalGross = totalGross.add(record.getGrossPay());
            totalDeductions = totalDeductions.add(record.getTotalDeductions());
            totalTaxes = totalTaxes.add(record.getTotalTaxes());
            totalNet = totalNet.add(record.getNetPay());
            totalEmployerContrib = totalEmployerContrib.add(record.getTotalEmployerContributions());
        }
        
        run.setTotalEmployees(records.size());
        run.setTotalGrossPay(totalGross);
        run.setTotalDeductions(totalDeductions);
        run.setTotalTaxes(totalTaxes);
        run.setTotalNetPay(totalNet);
        run.setTotalEmployerContributions(totalEmployerContrib);
    }

    private String generateTimesheetNumber() {
        return "TS-" + System.currentTimeMillis();
    }
}
