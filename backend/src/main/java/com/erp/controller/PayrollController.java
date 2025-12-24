package com.erp.controller;

import com.erp.model.*;
import com.erp.repository.*;
import com.erp.service.PayrollCalculationService;
import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/payroll")
@CrossOrigin(origins = "*")
public class PayrollController {

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

    @GetMapping("/timesheets")
    public ResponseEntity<List<Timesheet>> getAllTimesheets() {
        return ResponseEntity.ok(timesheetRepository.findAll());
    }

    @GetMapping("/timesheets/{id}")
    public ResponseEntity<Timesheet> getTimesheetById(@PathVariable Long id) {
        return timesheetRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/timesheets/employee/{employeeId}")
    public ResponseEntity<List<Timesheet>> getTimesheetsByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(timesheetRepository.findByEmployeeId(employeeId));
    }

    @GetMapping("/timesheets/status/{status}")
    public ResponseEntity<List<Timesheet>> getTimesheetsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(timesheetRepository.findByStatus(status));
    }

    @PostMapping("/timesheets")
    public ResponseEntity<Timesheet> createTimesheet(@RequestBody Map<String, Object> data) {
        Timesheet timesheet = new Timesheet();
        
        Long employeeId = Long.valueOf(data.get("employeeId").toString());
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
    public ResponseEntity<Timesheet> approveTimesheet(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return timesheetRepository.findById(id)
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
    public ResponseEntity<Timesheet> rejectTimesheet(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return timesheetRepository.findById(id)
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
    public ResponseEntity<List<PayrollRun>> getAllPayrollRuns() {
        return ResponseEntity.ok(payrollRunRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/runs/{id}")
    public ResponseEntity<PayrollRun> getPayrollRunById(@PathVariable Long id) {
        return payrollRunRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/runs/{id}/records")
    public ResponseEntity<List<PayrollRecord>> getPayrollRecordsByRun(@PathVariable Long id) {
        return ResponseEntity.ok(payrollRecordRepository.findByPayrollRunId(id));
    }

    @PostMapping("/runs")
    public ResponseEntity<PayrollRun> createPayrollRun(@RequestBody Map<String, Object> data) {
        PayrollRun run = new PayrollRun();
        run.setPayrollRunNumber(generatePayrollRunNumber());
        run.setDescription((String) data.get("description"));
        run.setPeriodStartDate(LocalDate.parse(data.get("periodStartDate").toString()));
        run.setPeriodEndDate(LocalDate.parse(data.get("periodEndDate").toString()));
        run.setPayDate(LocalDate.parse(data.get("payDate").toString()));
        
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
                    return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
                }
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/runs/{id}/process")
    public ResponseEntity<?> processPayroll(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return payrollRunRepository.findById(id)
            .map(run -> {
                if (!"CALCULATED".equals(run.getStatus()) && !"APPROVED".equals(run.getStatus())) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Payroll must be calculated or approved before processing"));
                }
                
                run.setStatus("PROCESSED");
                run.setProcessedAt(LocalDateTime.now());
                
                if (data.containsKey("processedById")) {
                    Long processedById = Long.valueOf(data.get("processedById").toString());
                    employeeRepository.findById(processedById).ifPresent(run::setProcessedBy);
                }
                
                List<PayrollRecord> records = payrollRecordRepository.findByPayrollRunId(id);
                for (PayrollRecord record : records) {
                    record.setStatus("PROCESSED");
                    payrollRecordRepository.save(record);
                }
                
                return ResponseEntity.ok(payrollRunRepository.save(run));
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
    public ResponseEntity<List<PayrollRecord>> getPayrollRecordsByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(payrollRecordRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId));
    }

    @GetMapping("/records/employee/{employeeId}/paystubs")
    public ResponseEntity<List<PayrollRecord>> getPaystubs(@PathVariable Long employeeId) {
        return ResponseEntity.ok(payrollRecordRepository.findProcessedPayrollRecordsByEmployee(employeeId));
    }

    @GetMapping("/benefits/employee/{employeeId}")
    public ResponseEntity<List<EmployeeBenefit>> getEmployeeBenefits(@PathVariable Long employeeId) {
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
    public ResponseEntity<List<ProjectTimesheet>> getAllProjectTimesheets() {
        return ResponseEntity.ok(projectTimesheetRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/project-timesheets/{id}")
    public ResponseEntity<ProjectTimesheet> getProjectTimesheetById(@PathVariable Long id) {
        return projectTimesheetRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/project-timesheets/employee/{employeeId}")
    public ResponseEntity<List<ProjectTimesheet>> getProjectTimesheetsByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(projectTimesheetRepository.findByEmployeeId(employeeId));
    }

    @GetMapping("/project-timesheets/project/{projectCode}")
    public ResponseEntity<List<ProjectTimesheet>> getProjectTimesheetsByProject(@PathVariable String projectCode) {
        return ResponseEntity.ok(projectTimesheetRepository.findByProjectCode(projectCode));
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
    public ResponseEntity<ProjectTimesheet> approveProjectTimesheet(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return projectTimesheetRepository.findById(id)
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
