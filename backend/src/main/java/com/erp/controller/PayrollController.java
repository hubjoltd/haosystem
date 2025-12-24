package com.erp.controller;

import com.erp.model.*;
import com.erp.repository.*;
import com.erp.service.PayrollCalculationService;

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
}
