package com.erp.controller;

import com.erp.model.*;
import com.erp.repository.*;
import com.erp.service.PayrollCalculationService;
import com.erp.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payroll")
@CrossOrigin(origins = "*")
public class PayrollController {

    private static final Logger logger = LoggerFactory.getLogger(PayrollController.class);

    @Autowired
    private PayrollRunRepository payrollRunRepository;

    @Autowired
    private PayrollRecordRepository payrollRecordRepository;

    @Autowired
    private TimesheetRepository timesheetRepository;

    @Autowired
    private EmployeeBenefitRepository employeeBenefitRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private PayrollCalculationService payrollCalculationService;

    @Autowired
    private ProjectTimesheetRepository projectTimesheetRepository;

    @Autowired
    private AttendanceRecordRepository attendanceRecordRepository;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    private Long extractBranchId(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtUtil.extractBranchId(token);
        }
        return null;
    }
    
    private boolean isSuperAdmin(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtUtil.extractIsSuperAdmin(token);
        }
        return false;
    }
    
    private List<Employee> getEmployeesForBranch(HttpServletRequest request) {
        if (isSuperAdmin(request)) {
            return employeeRepository.findByActiveTrue();
        }
        Long branchId = extractBranchId(request);
        if (branchId != null) {
            return employeeRepository.findByBranchIdAndActiveTrue(branchId);
        }
        return employeeRepository.findByActiveTrue();
    }
    
    private Set<Long> getEmployeeIdsForBranch(HttpServletRequest request) {
        return getEmployeesForBranch(request).stream()
                .map(Employee::getId)
                .collect(Collectors.toSet());
    }

    @GetMapping("/timesheets")
    public ResponseEntity<List<Timesheet>> getAllTimesheets(HttpServletRequest request) {
        Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(request);
        List<Timesheet> timesheets = timesheetRepository.findAll().stream()
                .filter(t -> t.getEmployee() != null && branchEmployeeIds.contains(t.getEmployee().getId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(timesheets);
    }

    @GetMapping("/timesheets/{id}")
    public ResponseEntity<Timesheet> getTimesheetById(HttpServletRequest request, @PathVariable Long id) {
        Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(request);
        return timesheetRepository.findById(id)
            .filter(t -> t.getEmployee() != null && branchEmployeeIds.contains(t.getEmployee().getId()))
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/timesheets/employee/{employeeId}")
    public ResponseEntity<List<Timesheet>> getTimesheetsByEmployee(HttpServletRequest request, @PathVariable Long employeeId) {
        Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(request);
        if (!branchEmployeeIds.contains(employeeId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(timesheetRepository.findByEmployeeId(employeeId));
    }

    @GetMapping("/timesheets/status/{status}")
    public ResponseEntity<List<Timesheet>> getTimesheetsByStatus(HttpServletRequest request, @PathVariable String status) {
        Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(request);
        List<Timesheet> timesheets = timesheetRepository.findByStatus(status).stream()
                .filter(t -> t.getEmployee() != null && branchEmployeeIds.contains(t.getEmployee().getId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(timesheets);
    }

    @PostMapping("/timesheets")
    public ResponseEntity<?> createTimesheet(HttpServletRequest request, @RequestBody Map<String, Object> data) {
        Long employeeId = Long.valueOf(data.get("employeeId").toString());
        Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(request);
        if (!branchEmployeeIds.contains(employeeId)) {
            return ResponseEntity.notFound().build();
        }
        
        Timesheet timesheet = new Timesheet();
        employeeRepository.findById(employeeId).ifPresent(timesheet::setEmployee);
        
        timesheet.setTimesheetNumber(generateTimesheetNumber());
        timesheet.setPeriodStartDate(LocalDate.parse(data.get("periodStartDate").toString()));
        timesheet.setPeriodEndDate(LocalDate.parse(data.get("periodEndDate").toString()));
        
        return ResponseEntity.ok(timesheetRepository.save(timesheet));
    }

    private String generateTimesheetNumber() {
        String prefix = "TS";
        String year = String.valueOf(LocalDate.now().getYear());
        long count = timesheetRepository.count() + 1;
        return prefix + "-" + year + "-" + String.format("%05d", count);
    }

    @PostMapping("/timesheets/generate")
    public ResponseEntity<?> generateTimesheets(@RequestBody Map<String, Object> data) {
        LocalDate startDate = LocalDate.parse(data.get("startDate").toString());
        LocalDate endDate = LocalDate.parse(data.get("endDate").toString());
        
        List<Timesheet> generated = payrollCalculationService.generateTimesheets(startDate, endDate);
        return ResponseEntity.ok(Map.of("generated", generated.size(), "timesheets", generated));
    }

    @PutMapping("/timesheets/{id}/approve")
    public ResponseEntity<Timesheet> approveTimesheet(HttpServletRequest request, @PathVariable Long id, @RequestBody Map<String, Object> data) {
        Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(request);
        return timesheetRepository.findById(id)
            .filter(t -> t.getEmployee() != null && branchEmployeeIds.contains(t.getEmployee().getId()))
            .map(timesheet -> {
                timesheet.setStatus("APPROVED");
                timesheet.setApprovedAt(LocalDateTime.now());
                if (data.containsKey("approverRemarks")) {
                    timesheet.setApproverRemarks((String) data.get("approverRemarks"));
                }
                if (data.containsKey("approverId")) {
                    Long approverId = Long.valueOf(data.get("approverId").toString());
                    employeeRepository.findById(approverId).ifPresent(timesheet::setApprovedBy);
                }
                return ResponseEntity.ok(timesheetRepository.save(timesheet));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/timesheets/{id}/reject")
    public ResponseEntity<Timesheet> rejectTimesheet(HttpServletRequest request, @PathVariable Long id, @RequestBody Map<String, Object> data) {
        Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(request);
        return timesheetRepository.findById(id)
            .filter(t -> t.getEmployee() != null && branchEmployeeIds.contains(t.getEmployee().getId()))
            .map(timesheet -> {
                timesheet.setStatus("REJECTED");
                if (data.containsKey("approverRemarks")) {
                    timesheet.setApproverRemarks((String) data.get("approverRemarks"));
                }
                return ResponseEntity.ok(timesheetRepository.save(timesheet));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/runs")
    public ResponseEntity<List<PayrollRun>> getAllPayrollRuns(HttpServletRequest request) {
        return ResponseEntity.ok(payrollRunRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/runs/{id}")
    public ResponseEntity<PayrollRun> getPayrollRunById(HttpServletRequest request, @PathVariable Long id) {
        return payrollRunRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/runs/{id}/records")
    public ResponseEntity<List<PayrollRecord>> getPayrollRecordsByRun(HttpServletRequest request, @PathVariable Long id) {
        Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(request);
        List<PayrollRecord> records = payrollRecordRepository.findByPayrollRunId(id).stream()
                .filter(r -> r.getEmployee() != null && branchEmployeeIds.contains(r.getEmployee().getId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(records);
    }

    @PostMapping("/runs")
    public ResponseEntity<PayrollRun> createPayrollRun(@RequestBody Map<String, Object> data) {
        PayrollRun run = new PayrollRun();
        run.setPayrollRunNumber(generatePayrollRunNumber());
        run.setDescription((String) data.get("description"));
        run.setPeriodStartDate(LocalDate.parse(data.get("periodStartDate").toString()));
        run.setPeriodEndDate(LocalDate.parse(data.get("periodEndDate").toString()));
        
        if (data.get("payDate") != null && !data.get("payDate").toString().isEmpty()) {
            run.setPayDate(LocalDate.parse(data.get("payDate").toString()));
        } else {
            run.setPayDate(run.getPeriodEndDate());
        }
        
        run.setStatus("PENDING");
        
        return ResponseEntity.ok(payrollRunRepository.save(run));
    }

    private String generatePayrollRunNumber() {
        String prefix = "PAY";
        String year = String.valueOf(LocalDate.now().getYear());
        long count = payrollRunRepository.count() + 1;
        return prefix + "-" + year + "-" + String.format("%05d", count);
    }

    @PostMapping("/runs/{id}/calculate")
    public ResponseEntity<?> calculatePayroll(@PathVariable Long id) {
        return payrollRunRepository.findById(id)
            .map(run -> {
                try {
                    PayrollRun calculatedRun = payrollCalculationService.calculatePayroll(run);
                    return ResponseEntity.ok(calculatedRun);
                } catch (Exception e) {
                    logger.error("Error calculating payroll run {}: {}", id, e.getMessage(), e);
                    String errorMsg = e.getMessage() != null ? e.getMessage() : "An unexpected error occurred during payroll calculation";
                    if (e.getCause() != null && e.getCause().getMessage() != null) {
                        errorMsg = e.getCause().getMessage();
                    }
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", errorMsg);
                    return ResponseEntity.badRequest().body(errorResponse);
                }
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/runs/{id}/process")
    public ResponseEntity<?> processPayroll(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return payrollRunRepository.findById(id)
            .map(run -> {
                if (!"CALCULATED".equals(run.getStatus()) && !"APPROVED".equals(run.getStatus()) && 
                    !"PARTIALLY_PROCESSED".equals(run.getStatus())) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Payroll must be calculated or approved before processing"));
                }
                
                if (!data.containsKey("payDate") || data.get("payDate") == null || data.get("payDate").toString().isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Pay date is required before processing payroll"));
                }
                
                run.setPayDate(LocalDate.parse(data.get("payDate").toString()));
                
                List<Long> selectedRecordIds = new ArrayList<>();
                if (data.containsKey("recordIds")) {
                    List<?> ids = (List<?>) data.get("recordIds");
                    for (Object recordId : ids) {
                        selectedRecordIds.add(Long.valueOf(recordId.toString()));
                    }
                }
                
                List<PayrollRecord> records;
                if (!selectedRecordIds.isEmpty()) {
                    records = payrollRecordRepository.findAllById(selectedRecordIds);
                } else {
                    records = payrollRecordRepository.findByPayrollRunId(id);
                }
                
                records = records.stream()
                    .filter(r -> !"PROCESSED".equals(r.getStatus()))
                    .toList();
                
                if (records.isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "No unprocessed records to process. All records have already been processed."));
                }
                
                BigDecimal totalGross = BigDecimal.ZERO;
                BigDecimal totalDeductions = BigDecimal.ZERO;
                BigDecimal totalTaxes = BigDecimal.ZERO;
                BigDecimal totalNet = BigDecimal.ZERO;
                BigDecimal totalEmployerContrib = BigDecimal.ZERO;
                int processedCount = 0;
                
                for (PayrollRecord record : records) {
                    if (record.getPayrollRun().getId().equals(id)) {
                        record.setStatus("PROCESSED");
                        payrollRecordRepository.save(record);
                        processedCount++;
                        
                        totalGross = totalGross.add(record.getGrossPay() != null ? record.getGrossPay() : BigDecimal.ZERO);
                        totalDeductions = totalDeductions.add(record.getTotalDeductions() != null ? record.getTotalDeductions() : BigDecimal.ZERO);
                        totalTaxes = totalTaxes.add(record.getTotalTaxes() != null ? record.getTotalTaxes() : BigDecimal.ZERO);
                        totalNet = totalNet.add(record.getNetPay() != null ? record.getNetPay() : BigDecimal.ZERO);
                        totalEmployerContrib = totalEmployerContrib.add(record.getTotalEmployerContributions() != null ? record.getTotalEmployerContributions() : BigDecimal.ZERO);
                    }
                }
                
                List<PayrollRecord> allRecords = payrollRecordRepository.findByPayrollRunId(id);
                boolean allProcessed = allRecords.stream().allMatch(r -> "PROCESSED".equals(r.getStatus()));
                
                if (allProcessed) {
                    run.setStatus("PROCESSED");
                    run.setProcessedAt(LocalDateTime.now());
                    run.setIsPostedToAccounts(true);
                    run.setPostedAt(LocalDateTime.now());
                }
                
                if (data.containsKey("processedById")) {
                    Long processedById = Long.valueOf(data.get("processedById").toString());
                    employeeRepository.findById(processedById).ifPresent(run::setProcessedBy);
                }
                
                payrollRunRepository.save(run);
                
                Map<String, Object> accountPostings = new HashMap<>();
                accountPostings.put("salaryExpenses", totalGross);
                accountPostings.put("employerContributions", totalEmployerContrib);
                accountPostings.put("loanDeductions", records.stream()
                    .map(r -> r.getLoanDeductions() != null ? r.getLoanDeductions() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add));
                accountPostings.put("taxLiabilities", totalTaxes);
                accountPostings.put("netPayable", totalNet);
                
                return ResponseEntity.ok(Map.of(
                    "payrollRun", run,
                    "processedCount", processedCount,
                    "totalGrossPay", totalGross,
                    "totalDeductions", totalDeductions,
                    "totalTaxes", totalTaxes,
                    "totalNetPay", totalNet,
                    "totalEmployerContributions", totalEmployerContrib,
                    "accountPostings", accountPostings,
                    "status", allProcessed ? "FULLY_PROCESSED" : "PARTIALLY_PROCESSED"
                ));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/runs/{id}/approve")
    public ResponseEntity<PayrollRun> approvePayrollRun(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return payrollRunRepository.findById(id)
            .map(run -> {
                run.setStatus("APPROVED");
                run.setApprovedAt(LocalDateTime.now());
                if (data.containsKey("approverId")) {
                    Long approverId = Long.valueOf(data.get("approverId").toString());
                    employeeRepository.findById(approverId).ifPresent(run::setApprovedBy);
                }
                return ResponseEntity.ok(payrollRunRepository.save(run));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/records/employee/{employeeId}")
    public ResponseEntity<List<PayrollRecord>> getPayrollRecordsByEmployee(HttpServletRequest request, @PathVariable Long employeeId) {
        Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(request);
        if (!branchEmployeeIds.contains(employeeId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(payrollRecordRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId));
    }

    @GetMapping("/records/employee/{employeeId}/paystubs")
    public ResponseEntity<List<PayrollRecord>> getPaystubs(HttpServletRequest request, @PathVariable Long employeeId) {
        Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(request);
        if (!branchEmployeeIds.contains(employeeId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(payrollRecordRepository.findProcessedPayrollRecordsByEmployee(employeeId));
    }

    @GetMapping("/benefits/employee/{employeeId}")
    public ResponseEntity<List<EmployeeBenefit>> getEmployeeBenefits(HttpServletRequest request, @PathVariable Long employeeId) {
        Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(request);
        if (!branchEmployeeIds.contains(employeeId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(employeeBenefitRepository.findByEmployeeIdAndIsActiveTrue(employeeId));
    }

    @PostMapping("/benefits")
    public ResponseEntity<EmployeeBenefit> createEmployeeBenefit(@RequestBody Map<String, Object> data) {
        EmployeeBenefit benefit = new EmployeeBenefit();
        
        Long employeeId = Long.valueOf(data.get("employeeId").toString());
        employeeRepository.findById(employeeId).ifPresent(benefit::setEmployee);
        
        benefit.setBenefitType((String) data.get("benefitType"));
        benefit.setPlanName((String) data.get("planName"));
        benefit.setCoverageLevel((String) data.get("coverageLevel"));
        
        if (data.containsKey("employeeContribution")) {
            benefit.setEmployeeContribution(new java.math.BigDecimal(data.get("employeeContribution").toString()));
        }
        if (data.containsKey("employerContribution")) {
            benefit.setEmployerContribution(new java.math.BigDecimal(data.get("employerContribution").toString()));
        }
        
        return ResponseEntity.ok(employeeBenefitRepository.save(benefit));
    }

    @PutMapping("/benefits/{id}")
    public ResponseEntity<EmployeeBenefit> updateEmployeeBenefit(@PathVariable Long id, @RequestBody EmployeeBenefit benefit) {
        return employeeBenefitRepository.findById(id)
            .map(existing -> {
                benefit.setId(id);
                benefit.setCreatedAt(existing.getCreatedAt());
                return ResponseEntity.ok(employeeBenefitRepository.save(benefit));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/benefits/{id}")
    public ResponseEntity<Void> deleteEmployeeBenefit(@PathVariable Long id) {
        if (employeeBenefitRepository.existsById(id)) {
            employeeBenefitRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/project-timesheets")
    public ResponseEntity<List<ProjectTimesheet>> getAllProjectTimesheets(HttpServletRequest request) {
        Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(request);
        List<ProjectTimesheet> timesheets = projectTimesheetRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(t -> t.getEmployee() != null && branchEmployeeIds.contains(t.getEmployee().getId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(timesheets);
    }

    @GetMapping("/project-timesheets/{id}")
    public ResponseEntity<ProjectTimesheet> getProjectTimesheetById(HttpServletRequest request, @PathVariable Long id) {
        Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(request);
        return projectTimesheetRepository.findById(id)
            .filter(t -> t.getEmployee() != null && branchEmployeeIds.contains(t.getEmployee().getId()))
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/project-timesheets/employee/{employeeId}")
    public ResponseEntity<List<ProjectTimesheet>> getProjectTimesheetsByEmployee(HttpServletRequest request, @PathVariable Long employeeId) {
        Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(request);
        if (!branchEmployeeIds.contains(employeeId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(projectTimesheetRepository.findByEmployeeId(employeeId));
    }

    @GetMapping("/project-timesheets/project/{projectCode}")
    public ResponseEntity<List<ProjectTimesheet>> getProjectTimesheetsByProject(HttpServletRequest request, @PathVariable String projectCode) {
        Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(request);
        List<ProjectTimesheet> timesheets = projectTimesheetRepository.findByProjectCode(projectCode).stream()
                .filter(t -> t.getEmployee() != null && branchEmployeeIds.contains(t.getEmployee().getId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(timesheets);
    }

    @PostMapping("/project-timesheets")
    public ResponseEntity<ProjectTimesheet> createProjectTimesheet(@RequestBody Map<String, Object> data) {
        ProjectTimesheet timesheet = new ProjectTimesheet();
        
        Long employeeId = Long.valueOf(data.get("employeeId").toString());
        employeeRepository.findById(employeeId).ifPresent(timesheet::setEmployee);
        
        timesheet.setProjectTimesheetNumber(generateProjectTimesheetNumber());
        timesheet.setProjectCode((String) data.get("projectCode"));
        timesheet.setProjectName((String) data.get("projectName"));
        timesheet.setPeriodStartDate(LocalDate.parse(data.get("periodStartDate").toString()));
        timesheet.setPeriodEndDate(LocalDate.parse(data.get("periodEndDate").toString()));
        
        if (data.containsKey("totalHours")) {
            timesheet.setTotalHours(new BigDecimal(data.get("totalHours").toString()));
        }
        if (data.containsKey("billableHours")) {
            timesheet.setBillableHours(new BigDecimal(data.get("billableHours").toString()));
        }
        if (data.containsKey("remarks")) {
            timesheet.setRemarks((String) data.get("remarks"));
        }
        
        return ResponseEntity.ok(projectTimesheetRepository.save(timesheet));
    }

    private String generateProjectTimesheetNumber() {
        String prefix = "PTS";
        String year = String.valueOf(LocalDate.now().getYear());
        long count = projectTimesheetRepository.count() + 1;
        return prefix + "-" + year + "-" + String.format("%05d", count);
    }

    @PutMapping("/project-timesheets/{id}/approve")
    public ResponseEntity<ProjectTimesheet> approveProjectTimesheet(HttpServletRequest request, @PathVariable Long id, @RequestBody Map<String, Object> data) {
        Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(request);
        return projectTimesheetRepository.findById(id)
            .filter(t -> t.getEmployee() != null && branchEmployeeIds.contains(t.getEmployee().getId()))
            .map(timesheet -> {
                timesheet.setStatus("APPROVED");
                timesheet.setApprovedAt(LocalDateTime.now());
                if (data.containsKey("approverRemarks")) {
                    timesheet.setApproverRemarks((String) data.get("approverRemarks"));
                }
                if (data.containsKey("approverId")) {
                    Long approverId = Long.valueOf(data.get("approverId").toString());
                    employeeRepository.findById(approverId).ifPresent(timesheet::setApprovedBy);
                }
                return ResponseEntity.ok(projectTimesheetRepository.save(timesheet));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/timesheets/generate-from-attendance")
    public ResponseEntity<?> generateTimesheetsFromAttendance(@RequestBody Map<String, Object> data) {
        LocalDate startDate = LocalDate.parse(data.get("startDate").toString());
        LocalDate endDate = LocalDate.parse(data.get("endDate").toString());
        String type = data.containsKey("type") ? (String) data.get("type") : "ATTENDANCE";
        
        List<Long> employeeIds = new ArrayList<>();
        if (data.containsKey("employeeIds")) {
            List<?> ids = (List<?>) data.get("employeeIds");
            for (Object id : ids) {
                employeeIds.add(Long.valueOf(id.toString()));
            }
        }
        
        List<Employee> employees;
        if (employeeIds.isEmpty()) {
            employees = employeeRepository.findByActiveTrue();
        } else {
            employees = employeeRepository.findAllById(employeeIds);
        }
        
        List<Object> generatedTimesheets = new ArrayList<>();
        
        if ("ATTENDANCE".equals(type)) {
            for (Employee employee : employees) {
                List<AttendanceRecord> attendanceRecords = attendanceRecordRepository
                    .findApprovedAttendanceByEmployeeAndDateRange(employee.getId(), startDate, endDate);
                
                if (!attendanceRecords.isEmpty()) {
                    Timesheet timesheet = new Timesheet();
                    timesheet.setTimesheetNumber(generateTimesheetNumber());
                    timesheet.setEmployee(employee);
                    timesheet.setPeriodStartDate(startDate);
                    timesheet.setPeriodEndDate(endDate);
                    
                    BigDecimal totalRegular = BigDecimal.ZERO;
                    BigDecimal totalOT = BigDecimal.ZERO;
                    int presentDays = 0;
                    int absentDays = 0;
                    int leaveDays = 0;
                    
                    for (AttendanceRecord record : attendanceRecords) {
                        if (record.getRegularHours() != null) {
                            totalRegular = totalRegular.add(record.getRegularHours());
                        }
                        if (record.getOvertimeHours() != null) {
                            totalOT = totalOT.add(record.getOvertimeHours());
                        }
                        if ("PRESENT".equals(record.getStatus())) {
                            presentDays++;
                        } else if ("ABSENT".equals(record.getStatus())) {
                            absentDays++;
                        } else if ("ON_LEAVE".equals(record.getStatus())) {
                            leaveDays++;
                        }
                    }
                    
                    timesheet.setTotalRegularHours(totalRegular);
                    timesheet.setTotalOvertimeHours(totalOT);
                    timesheet.setTotalHours(totalRegular.add(totalOT));
                    timesheet.setPresentDays(presentDays);
                    timesheet.setAbsentDays(absentDays);
                    timesheet.setLeaveDays(leaveDays);
                    timesheet.setWorkingDays(presentDays + absentDays + leaveDays);
                    timesheet.setStatus("PENDING_APPROVAL");
                    
                    generatedTimesheets.add(timesheetRepository.save(timesheet));
                }
            }
        } else if ("PROJECT".equals(type)) {
            String projectCode = data.containsKey("projectCode") ? (String) data.get("projectCode") : null;
            String projectName = data.containsKey("projectName") ? (String) data.get("projectName") : null;
            
            for (Employee employee : employees) {
                List<AttendanceRecord> attendanceRecords = attendanceRecordRepository
                    .findApprovedAttendanceByEmployeeAndDateRange(employee.getId(), startDate, endDate);
                
                if (!attendanceRecords.isEmpty()) {
                    ProjectTimesheet projectTimesheet = new ProjectTimesheet();
                    projectTimesheet.setProjectTimesheetNumber(generateProjectTimesheetNumber());
                    projectTimesheet.setEmployee(employee);
                    projectTimesheet.setPeriodStartDate(startDate);
                    projectTimesheet.setPeriodEndDate(endDate);
                    projectTimesheet.setProjectCode(projectCode);
                    projectTimesheet.setProjectName(projectName);
                    
                    BigDecimal totalRegular = BigDecimal.ZERO;
                    BigDecimal totalOT = BigDecimal.ZERO;
                    
                    for (AttendanceRecord record : attendanceRecords) {
                        if (record.getRegularHours() != null) {
                            totalRegular = totalRegular.add(record.getRegularHours());
                        }
                        if (record.getOvertimeHours() != null) {
                            totalOT = totalOT.add(record.getOvertimeHours());
                        }
                    }
                    
                    projectTimesheet.setRegularHours(totalRegular);
                    projectTimesheet.setOvertimeHours(totalOT);
                    projectTimesheet.setTotalHours(totalRegular.add(totalOT));
                    projectTimesheet.setBillableHours(totalRegular.add(totalOT));
                    projectTimesheet.setStatus("PENDING_APPROVAL");
                    
                    generatedTimesheets.add(projectTimesheetRepository.save(projectTimesheet));
                }
            }
        }
        
        return ResponseEntity.ok(Map.of(
            "generated", generatedTimesheets.size(),
            "type", type,
            "timesheets", generatedTimesheets
        ));
    }

    @GetMapping("/attendance/approved")
    public ResponseEntity<List<AttendanceRecord>> getApprovedAttendance(
            @RequestParam String startDate, 
            @RequestParam String endDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        return ResponseEntity.ok(attendanceRecordRepository.findApprovedAttendanceBetweenDates(start, end));
    }

    @GetMapping("/attendance/summary")
    public ResponseEntity<?> getAttendanceSummary(
            @RequestParam String startDate, 
            @RequestParam String endDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        
        List<AttendanceRecord> records = attendanceRecordRepository.findByAttendanceDateBetween(start, end);
        
        Map<Long, Map<String, Object>> employeeSummary = new HashMap<>();
        
        for (AttendanceRecord record : records) {
            Long empId = record.getEmployee().getId();
            
            if (!employeeSummary.containsKey(empId)) {
                Map<String, Object> summary = new HashMap<>();
                summary.put("employeeId", empId);
                summary.put("employeeName", record.getEmployee().getFirstName() + " " + record.getEmployee().getLastName());
                summary.put("totalRegularHours", BigDecimal.ZERO);
                summary.put("totalOvertimeHours", BigDecimal.ZERO);
                summary.put("presentDays", 0);
                summary.put("absentDays", 0);
                summary.put("leaveDays", 0);
                summary.put("approvedCount", 0);
                summary.put("pendingCount", 0);
                employeeSummary.put(empId, summary);
            }
            
            Map<String, Object> summary = employeeSummary.get(empId);
            
            if (record.getRegularHours() != null) {
                BigDecimal current = (BigDecimal) summary.get("totalRegularHours");
                summary.put("totalRegularHours", current.add(record.getRegularHours()));
            }
            if (record.getOvertimeHours() != null) {
                BigDecimal current = (BigDecimal) summary.get("totalOvertimeHours");
                summary.put("totalOvertimeHours", current.add(record.getOvertimeHours()));
            }
            
            if ("PRESENT".equals(record.getStatus())) {
                summary.put("presentDays", (int) summary.get("presentDays") + 1);
            } else if ("ABSENT".equals(record.getStatus())) {
                summary.put("absentDays", (int) summary.get("absentDays") + 1);
            } else if ("ON_LEAVE".equals(record.getStatus())) {
                summary.put("leaveDays", (int) summary.get("leaveDays") + 1);
            }
            
            if ("APPROVED".equals(record.getApprovalStatus())) {
                summary.put("approvedCount", (int) summary.get("approvedCount") + 1);
            } else if ("PENDING".equals(record.getApprovalStatus())) {
                summary.put("pendingCount", (int) summary.get("pendingCount") + 1);
            }
        }
        
        return ResponseEntity.ok(new ArrayList<>(employeeSummary.values()));
    }
}
