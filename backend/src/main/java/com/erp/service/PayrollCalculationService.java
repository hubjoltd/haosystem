package com.erp.service;

import com.erp.model.*;
import com.erp.repository.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class PayrollCalculationService {

    private static final Logger logger = LoggerFactory.getLogger(PayrollCalculationService.class);

    private static final BigDecimal HOURS_PER_YEAR = new BigDecimal("2080");
    private static final BigDecimal SOCIAL_SECURITY_RATE = new BigDecimal("0.062");
    private static final BigDecimal MEDICARE_RATE = new BigDecimal("0.0145");
    private static final BigDecimal DISABILITY_RATE = new BigDecimal("0.009");
    private static final BigDecimal SOCIAL_SECURITY_WAGE_BASE = new BigDecimal("168600"); // 2024
    private static final BigDecimal FLSA_OVERTIME_MULTIPLIER = new BigDecimal("1.5");

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

    @Autowired
    private FLSAOvertimeService flsaOvertimeService;

    @Autowired
    private ExpenseRequestRepository expenseRequestRepository;

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

    private static final BigDecimal LUNCH_BREAK_HOURS = new BigDecimal("1.0");
    private static final BigDecimal MAX_REGULAR_HOURS_PER_DAY = new BigDecimal("8.0");

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
            BigDecimal dailyRegular = BigDecimal.ZERO;
            BigDecimal dailyOT = BigDecimal.ZERO;
            
            if (record.getClockIn() != null && record.getClockOut() != null) {
                long minutesWorked = Duration.between(record.getClockIn(), record.getClockOut()).toMinutes();
                if (minutesWorked < 0) {
                    minutesWorked += 24 * 60;
                }
                BigDecimal rawHours = new BigDecimal(minutesWorked).divide(new BigDecimal("60"), 2, RoundingMode.HALF_UP);
                
                BigDecimal effectiveHours;
                if (rawHours.compareTo(LUNCH_BREAK_HOURS) > 0) {
                    effectiveHours = rawHours.subtract(LUNCH_BREAK_HOURS);
                } else {
                    effectiveHours = rawHours;
                }
                
                if (effectiveHours.compareTo(MAX_REGULAR_HOURS_PER_DAY) <= 0) {
                    dailyRegular = effectiveHours;
                } else {
                    dailyRegular = MAX_REGULAR_HOURS_PER_DAY;
                    dailyOT = effectiveHours.subtract(MAX_REGULAR_HOURS_PER_DAY);
                }
                
                logger.info("Employee {} date {} - Raw: {}h, After lunch: {}h, Regular: {}h, OT: {}h",
                    timesheet.getEmployee().getId(), record.getAttendanceDate(),
                    rawHours, effectiveHours, dailyRegular, dailyOT);
            } else {
                if (record.getRegularHours() != null) {
                    dailyRegular = record.getRegularHours();
                }
                if (record.getOvertimeHours() != null) {
                    dailyOT = record.getOvertimeHours();
                }
            }
            
            record.setRegularHours(dailyRegular);
            record.setOvertimeHours(dailyOT);
            record.setBreakDuration(LUNCH_BREAK_HOURS);
            
            totalRegular = totalRegular.add(dailyRegular);
            totalOT = totalOT.add(dailyOT);
            
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
        
        logger.info("Timesheet {} - Total Regular: {}h, Total OT: {}h, Total: {}h, Present: {} days",
            timesheet.getTimesheetNumber(), totalRegular, totalOT, totalRegular.add(totalOT), present);
    }

    @Transactional(noRollbackFor = PayrollCalculationException.class)
    public PayrollRun calculatePayroll(PayrollRun run) {
        run.setStatus("CALCULATING");
        payrollRunRepository.save(run);
        payrollRunRepository.flush();
        
        try {
            logger.info("Looking for approved timesheets for period {} to {}", run.getPeriodStartDate(), run.getPeriodEndDate());
            
            List<Timesheet> timesheets = timesheetRepository.findApprovedTimesheetsByPeriod(
                run.getPeriodStartDate(), run.getPeriodEndDate());
            logger.info("Found {} approved timesheets for period", timesheets.size());
            
            if (timesheets.isEmpty()) {
                logger.info("No approved timesheets found. Checking for exact-period timesheets...");
                List<Timesheet> exactTimesheets = timesheetRepository.findByPeriodStartDateAndPeriodEndDate(
                    run.getPeriodStartDate(), run.getPeriodEndDate());
                logger.info("Found {} timesheets (any status) for exact period", exactTimesheets.size());
                
                if (!exactTimesheets.isEmpty()) {
                    for (Timesheet ts : exactTimesheets) {
                        if (!"APPROVED".equals(ts.getStatus())) {
                            ts.setStatus("APPROVED");
                            ts.setApprovedAt(java.time.LocalDateTime.now());
                            timesheetRepository.save(ts);
                            logger.info("Auto-approved timesheet {} for employee {}", ts.getTimesheetNumber(), ts.getEmployee().getId());
                        }
                    }
                    timesheets = exactTimesheets;
                } else {
                    logger.info("No timesheets at all. Auto-generating from attendance records...");
                    List<Timesheet> generated = generateTimesheets(run.getPeriodStartDate(), run.getPeriodEndDate());
                    logger.info("Auto-generated {} timesheets from attendance", generated.size());
                    
                    if (generated.isEmpty()) {
                        List<AttendanceRecord> attendanceRecords = attendanceRecordRepository.findByAttendanceDateBetween(
                            run.getPeriodStartDate(), run.getPeriodEndDate());
                        logger.info("Found {} attendance records (any status) in period", attendanceRecords.size());
                        
                        if (attendanceRecords.isEmpty()) {
                            run.setStatus("ERROR");
                            payrollRunRepository.save(run);
                            throw new PayrollCalculationException("No attendance records found for this period (" + 
                                run.getPeriodStartDate() + " to " + run.getPeriodEndDate() + 
                                "). Please ensure employees have clocked in/out for this period.");
                        }
                        
                        generated = generateTimesheetsFromAllAttendance(run.getPeriodStartDate(), run.getPeriodEndDate());
                        logger.info("Generated {} timesheets from all attendance (including non-approved)", generated.size());
                    }
                    
                    for (Timesheet ts : generated) {
                        ts.setStatus("APPROVED");
                        ts.setApprovedAt(java.time.LocalDateTime.now());
                        timesheetRepository.save(ts);
                        logger.info("Auto-approved generated timesheet {} for employee {}", ts.getTimesheetNumber(), 
                            ts.getEmployee() != null ? ts.getEmployee().getId() : "null");
                    }
                    timesheets = generated;
                }
            }
            
            if (timesheets.isEmpty()) {
                run.setStatus("ERROR");
                payrollRunRepository.save(run);
                throw new PayrollCalculationException("No attendance data could be found for this period. Please ensure employees have attendance records.");
            }
            
            for (Timesheet ts : timesheets) {
                logger.info("Refreshing timesheet {} for employee {} from current attendance data",
                    ts.getTimesheetNumber(), ts.getEmployee().getId());
                calculateTimesheetFromAttendance(ts);
                timesheetRepository.save(ts);
                logger.info("Refreshed timesheet {} - Regular: {}h, OT: {}h, Total: {}h",
                    ts.getTimesheetNumber(), ts.getTotalRegularHours(), ts.getTotalOvertimeHours(), ts.getTotalHours());
            }
            
            int successCount = 0;
            int failCount = 0;
            
            for (Timesheet timesheet : timesheets) {
                try {
                    PayrollRecord record = calculateEmployeePayroll(run, timesheet.getEmployee(), timesheet);
                    payrollRecordRepository.save(record);
                    successCount++;
                    logger.info("Calculated payroll for employee {} - Gross: {}", 
                        timesheet.getEmployee().getId(), record.getGrossPay());
                } catch (Exception e) {
                    failCount++;
                    logger.error("Error calculating payroll for employee {}: {}", 
                        timesheet.getEmployee() != null ? timesheet.getEmployee().getId() : "null", e.getMessage(), e);
                }
            }
            
            if (successCount == 0) {
                run.setStatus("ERROR");
                payrollRunRepository.save(run);
                throw new PayrollCalculationException("No payroll records could be calculated. Ensure employees have salary/hourly rate configured.");
            }
            
            aggregatePayrollTotals(run);
            
            run.setStatus("CALCULATED");
            logger.info("Payroll calculation completed: {} succeeded, {} failed", successCount, failCount);
            return payrollRunRepository.save(run);
        } catch (PayrollCalculationException e) {
            throw e;
        } catch (Exception e) {
            run.setStatus("ERROR");
            payrollRunRepository.save(run);
            throw new PayrollCalculationException("Unexpected error during payroll calculation: " + e.getMessage());
        }
    }
    
    @Transactional
    public List<Timesheet> generateTimesheetsFromAllAttendance(LocalDate startDate, LocalDate endDate) {
        List<AttendanceRecord> allRecords = attendanceRecordRepository.findByAttendanceDateBetween(startDate, endDate);
        
        Map<Long, List<AttendanceRecord>> byEmployee = new HashMap<>();
        for (AttendanceRecord record : allRecords) {
            if (record.getEmployee() != null && record.getClockIn() != null && record.getClockOut() != null) {
                byEmployee.computeIfAbsent(record.getEmployee().getId(), k -> new ArrayList<>()).add(record);
            }
        }
        
        List<Timesheet> timesheets = new ArrayList<>();
        for (Map.Entry<Long, List<AttendanceRecord>> entry : byEmployee.entrySet()) {
            Long employeeId = entry.getKey();
            List<AttendanceRecord> records = entry.getValue();
            
            Optional<Timesheet> existing = timesheetRepository.findByEmployeeIdAndPeriodStartDateAndPeriodEndDate(
                employeeId, startDate, endDate);
            if (existing.isPresent()) {
                timesheets.add(existing.get());
                continue;
            }
            
            Optional<Employee> empOpt = employeeRepository.findById(employeeId);
            if (empOpt.isEmpty()) continue;
            
            Timesheet timesheet = new Timesheet();
            timesheet.setEmployee(empOpt.get());
            timesheet.setTimesheetNumber(generateTimesheetNumber());
            timesheet.setPeriodStartDate(startDate);
            timesheet.setPeriodEndDate(endDate);
            
            calculateTimesheetFromAttendance(timesheet);
            
            timesheets.add(timesheetRepository.save(timesheet));
            logger.info("Generated timesheet from all attendance for employee {} - Regular: {}h, OT: {}h", 
                employeeId, timesheet.getTotalRegularHours(), timesheet.getTotalOvertimeHours());
        }
        
        return timesheets;
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
        
        BigDecimal hourlyRate = calculateHourlyRate(annualSalary);
        record.setHourlyRate(hourlyRate);
        
        BigDecimal regularHours = BigDecimal.ZERO;
        BigDecimal overtimeHours = BigDecimal.ZERO;
        BigDecimal totalHours = BigDecimal.ZERO;
        
        if (timesheet != null) {
            regularHours = timesheet.getTotalRegularHours() != null ? timesheet.getTotalRegularHours() : BigDecimal.ZERO;
            overtimeHours = timesheet.getTotalOvertimeHours() != null ? timesheet.getTotalOvertimeHours() : BigDecimal.ZERO;
            totalHours = timesheet.getTotalHours() != null ? timesheet.getTotalHours() : regularHours.add(overtimeHours);
            logger.info("Employee {} - Using timesheet hours: total={}, regular={}, overtime={}", 
                employee.getId(), totalHours, regularHours, overtimeHours);
        } else {
            FLSAOvertimeService.WeeklyOvertimeResult flsaResult = flsaOvertimeService.aggregatePeriodOvertime(
                employee.getId(), run.getPeriodStartDate(), run.getPeriodEndDate());
            regularHours = flsaResult.getRegularHours();
            overtimeHours = flsaResult.getOvertimeHours();
            totalHours = regularHours.add(overtimeHours).add(flsaResult.getDoubleTimeHours());
            logger.info("Employee {} - Using attendance hours: total={}, regular={}, overtime={}", 
                employee.getId(), totalHours, regularHours, overtimeHours);
        }
        
        record.setRegularHours(regularHours);
        record.setOvertimeHours(overtimeHours);
        
        BigDecimal basePay = regularHours.multiply(hourlyRate).setScale(2, RoundingMode.HALF_UP);
        record.setBasePay(basePay);
        
        BigDecimal overtimePay = overtimeHours.multiply(hourlyRate).multiply(FLSA_OVERTIME_MULTIPLIER).setScale(2, RoundingMode.HALF_UP);
        record.setOvertimePay(overtimePay);
        
        record.setBonuses(BigDecimal.ZERO);

        BigDecimal reimbursementTotal = calculateReimbursements(employee, run);
        record.setReimbursements(reimbursementTotal);
        
        BigDecimal grossPay = basePay.add(overtimePay).add(record.getBonuses());
        record.setGrossPay(grossPay);
        
        logger.info("Employee {} - Hourly rate: {}, Total hours: {}, Gross pay: {}, Reimbursements: {}", 
            employee.getId(), hourlyRate, totalHours, grossPay, reimbursementTotal);
        
        calculatePreTaxDeductions(record, employee);
        
        BigDecimal taxableIncome = grossPay.subtract(record.getPreTaxDeductions());
        record.setTaxableIncome(taxableIncome);
        
        calculateTaxes(record, taxableIncome, annualSalary);
        
        calculatePostTaxDeductions(record);
        
        BigDecimal totalDeductions = record.getPreTaxDeductions()
            .add(record.getTotalTaxes())
            .add(record.getPostTaxDeductions());
        record.setTotalDeductions(totalDeductions);
        
        BigDecimal netPay = grossPay.subtract(totalDeductions).add(reimbursementTotal);
        record.setNetPay(netPay);
        
        calculateEmployerContributions(record);
        
        return record;
    }

    private BigDecimal calculateReimbursements(Employee employee, PayrollRun run) {
        BigDecimal total = BigDecimal.ZERO;
        try {
            List<ExpenseRequest> approvedExpenses = expenseRequestRepository
                .findApprovedReimbursementsByExpenseDate(
                    employee.getId(), run.getPeriodStartDate(), run.getPeriodEndDate());

            if (approvedExpenses.isEmpty()) {
                approvedExpenses = expenseRequestRepository
                    .findApprovedReimbursementsForPayroll(
                        employee.getId(), run.getPeriodStartDate(), run.getPeriodEndDate());
            }

            for (ExpenseRequest expense : approvedExpenses) {
                BigDecimal amount = expense.getApprovedAmount() != null && expense.getApprovedAmount().compareTo(BigDecimal.ZERO) > 0
                    ? expense.getApprovedAmount()
                    : expense.getTotalAmount();
                total = total.add(amount);

                expense.setReimbursementStatus("PROCESSED");
                expense.setReimbursedAt(LocalDateTime.now());
                expenseRequestRepository.save(expense);

                logger.info("Employee {} - Including reimbursement {} amount {} from expense request {}",
                    employee.getId(), expense.getRequestNumber(), amount, expense.getId());
            }
        } catch (Exception e) {
            logger.warn("Error fetching reimbursements for employee {}: {}", employee.getId(), e.getMessage());
        }
        return total.setScale(2, RoundingMode.HALF_UP);
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
