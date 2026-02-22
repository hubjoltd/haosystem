package com.erp.controller;

import com.erp.model.AttendanceRecord;
import com.erp.model.AttendanceRule;
import com.erp.model.ProjectTimeEntry;
import com.erp.model.Employee;
import com.erp.repository.AttendanceRecordRepository;
import com.erp.repository.AttendanceRuleRepository;
import com.erp.repository.ProjectTimeEntryRepository;
import com.erp.repository.EmployeeRepository;
import com.erp.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/attendance")
 public class AttendanceController {

    @Autowired
    private AttendanceRecordRepository attendanceRecordRepository;

    @Autowired
    private AttendanceRuleRepository attendanceRuleRepository;

    @Autowired
    private ProjectTimeEntryRepository projectTimeEntryRepository;

    @Autowired
    private EmployeeRepository employeeRepository;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    private Long extractBranchId(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtUtil.extractBranchId(token);
        }
        return 1l;
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

    @GetMapping
    public ResponseEntity<List<AttendanceRecord>> getAllRecords(HttpServletRequest request) {
        Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(request);
        List<AttendanceRecord> records = attendanceRecordRepository.findAll().stream()
                .filter(r -> r.getEmployee() != null
                //        && branchEmployeeIds.contains(r.getEmployee().getId())
                )
                .collect(Collectors.toList());
        return ResponseEntity.ok(records);
    }
    
    @GetMapping("/employees-for-clock")
    public ResponseEntity<List<Employee>> getEmployeesForClock(HttpServletRequest request) {
        return ResponseEntity.ok(getEmployeesForBranch(request));
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<AttendanceRecord>> getByDateRange(
            HttpServletRequest request,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(request);
        List<AttendanceRecord> records = attendanceRecordRepository.findByAttendanceDateBetween(start, end).stream()
                .filter(r -> r.getEmployee() != null
                        //&& branchEmployeeIds.contains(r.getEmployee().getId())
                )
                .collect(Collectors.toList());
        return ResponseEntity.ok(records);
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<AttendanceRecord>> getByEmployee(HttpServletRequest request, @PathVariable Long employeeId) {
        Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(request);
//        if (!branchEmployeeIds.contains(employeeId)) {
//            return ResponseEntity.notFound().build();
//        }
        return ResponseEntity.ok(attendanceRecordRepository.findByEmployeeId(employeeId));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<AttendanceRecord>> getByDate(HttpServletRequest request, @PathVariable String date) {
        LocalDate localDate = LocalDate.parse(date);
       // Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(request);
        List<AttendanceRecord> records = attendanceRecordRepository.findByAttendanceDate(localDate).stream()
                .filter(r -> r.getEmployee() != null
                       // && branchEmployeeIds.contains(r.getEmployee().getId())
                )
                .collect(Collectors.toList());
        return ResponseEntity.ok(records);
    }

    @GetMapping("/employee/{employeeId}/range")
    public ResponseEntity<List<AttendanceRecord>> getByEmployeeAndDateRange(
            HttpServletRequest request,
            @PathVariable Long employeeId,
            @RequestParam String startDate,
            @RequestParam String endDate) {
       // Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(request);
//        if (!branchEmployeeIds.contains(employeeId)) {
//            return ResponseEntity.notFound().build();
//        }
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        return ResponseEntity.ok(attendanceRecordRepository.findByEmployeeIdAndAttendanceDateBetween(employeeId, start, end));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AttendanceRecord> getById(HttpServletRequest request, @PathVariable Long id) {
       // Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(request);
        return attendanceRecordRepository.findById(id)
            .filter(r -> r.getEmployee() != null )
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/clock-in")
    public ResponseEntity<?> clockIn(HttpServletRequest httpRequest, @RequestBody Map<String, Object> request) {
        try {
        Long employeeId = Long.valueOf(request.get("employeeId").toString());

        System.out.println("Employee Id is "+employeeId);
        Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(httpRequest);
//        if (!branchEmployeeIds.contains(employeeId)) {
//            return ResponseEntity.badRequest().body(Map.of("error", "Employee not found in your branch"));
//        }
        String captureMethod = (String) request.getOrDefault("captureMethod", "WEB");
        String clientTime = (String) request.get("clientTime");
        String clientDate = (String) request.get("clientDate");

        Employee employee = employeeRepository.findById(employeeId).orElse(null);
        if (employee == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Employee not found"));
        }

        LocalDate today = clientDate != null ? LocalDate.parse(clientDate) : LocalDate.now();
        Optional<AttendanceRecord> existing = attendanceRecordRepository.findByEmployeeIdAndAttendanceDate(employeeId, today);
        if (existing.isPresent() && existing.get().getClockIn() != null && existing.get().getClockOut() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Already clocked in for " + today + ". Please clock out first."));
        }
        if (existing.isPresent() && existing.get().getClockIn() != null && existing.get().getClockOut() != null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Attendance already completed for " + today + ". Use 'Add Entry' for corrections."));
        }

        AttendanceRecord record = existing.orElse(new AttendanceRecord());
        record.setEmployee(employee);
        record.setAttendanceDate(today);
        LocalTime clockInTime = clientTime != null ? LocalTime.parse(clientTime) : LocalTime.now();
        record.setClockIn(clockInTime);
        record.setCaptureMethod(captureMethod);
        record.setStatus("PRESENT");
        record.setApprovalStatus("APPROVED");
        
        // Set project information from employee's assigned project
        if (employee.getProject() != null) {
            record.setProjectCode(employee.getProject().getProjectCode());
            record.setProjectName(employee.getProject().getName());
        }

        AttendanceRule rule = attendanceRuleRepository.findByIsDefaultTrue().orElse(null);
        if (rule != null && rule.getStandardStartTime() != null && rule.getGraceMinutesIn() != null) {
            LocalTime graceTime = rule.getStandardStartTime().plusMinutes(rule.getGraceMinutesIn());
            if (record.getClockIn().isAfter(graceTime)) {
                record.setLateArrival(true);
                record.setLateMinutes((int) ChronoUnit.MINUTES.between(graceTime, record.getClockIn()));
            } else {
                record.setLateArrival(false);
                record.setLateMinutes(0);
            }
        }

        return ResponseEntity.ok(attendanceRecordRepository.save(record));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Clock-in failed: " + e.getMessage()));
        }
    }

    @PostMapping("/clock-out")
    public ResponseEntity<?> clockOut(HttpServletRequest httpRequest, @RequestBody Map<String, Object> request) {
        Long employeeId = Long.valueOf(request.get("employeeId").toString());
        Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(httpRequest);
//        if (!branchEmployeeIds.contains(employeeId)) {
//            return ResponseEntity.badRequest().body(Map.of("error", "Employee not found in your branch"));
//        }
        String clientTime = (String) request.get("clientTime");
        String clientDate = (String) request.get("clientDate");

        LocalDate today = clientDate != null ? LocalDate.parse(clientDate) : LocalDate.now();
        Optional<AttendanceRecord> existing = attendanceRecordRepository.findByEmployeeIdAndAttendanceDate(employeeId, today);
        if (existing.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No clock-in record found for today"));
        }

        AttendanceRecord record = existing.get();
        if (record.getClockOut() != null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Already clocked out today"));
        }

        LocalTime clockOutTime = clientTime != null ? LocalTime.parse(clientTime) : LocalTime.now();
        record.setClockOut(clockOutTime);

        if (record.getClockIn() != null) {
            long minutesWorked = ChronoUnit.MINUTES.between(record.getClockIn(), record.getClockOut());
            BigDecimal hoursWorked = BigDecimal.valueOf(minutesWorked / 60.0);

            AttendanceRule rule = attendanceRuleRepository.findByIsDefaultTrue().orElse(null);
            BigDecimal regularHours = rule != null && rule.getRegularHoursPerDay() != null
                ? rule.getRegularHoursPerDay()
                : BigDecimal.valueOf(8);

            if (rule != null && rule.getAutoDeductBreak() != null && rule.getAutoDeductBreak() && rule.getBreakDurationMinutes() != null) {
                BigDecimal breakHours = rule.getBreakDurationMinutes().divide(BigDecimal.valueOf(60), 2, java.math.RoundingMode.HALF_UP);
                hoursWorked = hoursWorked.subtract(breakHours);
                record.setBreakDuration(rule.getBreakDurationMinutes());
            }

            if (hoursWorked.compareTo(regularHours) > 0) {
                record.setRegularHours(regularHours);
                record.setOvertimeHours(hoursWorked.subtract(regularHours));
            } else {
                record.setRegularHours(hoursWorked);
                record.setOvertimeHours(BigDecimal.ZERO);
            }

            if (rule != null && rule.getStandardEndTime() != null && rule.getGraceMinutesOut() != null) {
                LocalTime earlyTime = rule.getStandardEndTime().minusMinutes(rule.getGraceMinutesOut());
                if (record.getClockOut().isBefore(earlyTime)) {
                    record.setEarlyDeparture(true);
                    record.setEarlyMinutes((int) ChronoUnit.MINUTES.between(record.getClockOut(), earlyTime));
                }
            }
        }

        record.setApprovalStatus("PENDING");

        return ResponseEntity.ok(attendanceRecordRepository.save(record));
    }

    @PostMapping("/manual-entry")
    public ResponseEntity<?> manualEntry(HttpServletRequest httpRequest, @RequestBody Map<String, Object> request) {
        Long employeeId = null;
        
        if (request.containsKey("employeeId") && request.get("employeeId") != null) {
            employeeId = Long.valueOf(request.get("employeeId").toString());
        } else if (request.containsKey("employee") && request.get("employee") != null) {
            @SuppressWarnings("unchecked")
            Map<String, Object> empMap = (Map<String, Object>) request.get("employee");
            if (empMap.containsKey("id") && empMap.get("id") != null) {
                employeeId = Long.valueOf(empMap.get("id").toString());
            }
        }
        
        if (employeeId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Employee ID is required"));
        }
        
        Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(httpRequest);
//        if (!branchEmployeeIds.contains(employeeId)) {
//            return ResponseEntity.notFound().build();
//        }

        Employee employee = employeeRepository.findById(employeeId).orElse(null);
        if (employee == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Employee not found"));
        }

        String attendanceDateStr = request.get("attendanceDate") != null ? request.get("attendanceDate").toString() : null;
        if (attendanceDateStr == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Attendance date is required"));
        }
        LocalDate attendanceDate = LocalDate.parse(attendanceDateStr);
        
        String clockInStr = request.get("clockIn") != null ? request.get("clockIn").toString().trim() : "";
        String clockOutStr = request.get("clockOut") != null ? request.get("clockOut").toString().trim() : "";
        String status = request.get("status") != null ? request.get("status").toString() : "PRESENT";
        String remarks = request.get("remarks") != null ? request.get("remarks").toString() : null;
        
        LocalTime clockIn = clockInStr.isEmpty() ? null : LocalTime.parse(clockInStr);
        LocalTime clockOut = clockOutStr.isEmpty() ? null : LocalTime.parse(clockOutStr);

        Optional<AttendanceRecord> existing = attendanceRecordRepository.findByEmployeeIdAndAttendanceDate(employeeId, attendanceDate);
        
        AttendanceRecord record;
        if (existing.isPresent()) {
            record = existing.get();
        } else {
            record = new AttendanceRecord();
            record.setEmployee(employee);
            record.setAttendanceDate(attendanceDate);
        }
        
        record.setClockIn(clockIn);
        record.setClockOut(clockOut);
        record.setStatus(status);
        record.setRemarks(remarks);
        record.setCaptureMethod("MANUAL");
        record.setApprovalStatus("PENDING");
        
        if (employee.getProject() != null) {
            record.setProjectCode(employee.getProject().getProjectCode());
            record.setProjectName(employee.getProject().getName());
        }

        if (clockIn != null && clockOut != null) {
            long minutesWorked = ChronoUnit.MINUTES.between(clockIn, clockOut);
            BigDecimal hoursWorked = BigDecimal.valueOf(minutesWorked / 60.0);
            
            AttendanceRule rule = attendanceRuleRepository.findByIsDefaultTrue().orElse(null);
            BigDecimal regularHoursLimit = rule != null && rule.getRegularHoursPerDay() != null
                ? rule.getRegularHoursPerDay()
                : BigDecimal.valueOf(8);
            
            if (rule != null && rule.getAutoDeductBreak() != null && rule.getAutoDeductBreak() && rule.getBreakDurationMinutes() != null) {
                BigDecimal breakHours = rule.getBreakDurationMinutes().divide(BigDecimal.valueOf(60), 2, java.math.RoundingMode.HALF_UP);
                hoursWorked = hoursWorked.subtract(breakHours);
                record.setBreakDuration(rule.getBreakDurationMinutes());
            }
            
            if (hoursWorked.compareTo(regularHoursLimit) > 0) {
                record.setRegularHours(regularHoursLimit);
                record.setOvertimeHours(hoursWorked.subtract(regularHoursLimit));
            } else {
                record.setRegularHours(hoursWorked.compareTo(BigDecimal.ZERO) > 0 ? hoursWorked : BigDecimal.ZERO);
                record.setOvertimeHours(BigDecimal.ZERO);
            }
        }

        return ResponseEntity.ok(attendanceRecordRepository.save(record));
    }

    @PostMapping("/bulk-upload")
    public ResponseEntity<?> bulkUpload(@RequestBody List<Map<String, Object>> records) {
        List<AttendanceRecord> savedRecords = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (Map<String, Object> data : records) {
            try {
                Long employeeId = Long.valueOf(data.get("employeeId").toString());
                Employee employee = employeeRepository.findById(employeeId).orElse(null);
                if (employee == null) {
                    errors.add("Employee not found: " + employeeId);
                    continue;
                }

                LocalDate attendanceDate = LocalDate.parse(data.get("date").toString());
                
                // Check for existing entry to prevent duplicates - update instead
                Optional<AttendanceRecord> existing = attendanceRecordRepository.findByEmployeeIdAndAttendanceDate(employeeId, attendanceDate);
                AttendanceRecord record;
                if (existing.isPresent()) {
                    record = existing.get();
                } else {
                    record = new AttendanceRecord();
                    record.setEmployee(employee);
                    record.setAttendanceDate(attendanceDate);
                }
                
                record.setStatus((String) data.getOrDefault("status", "PRESENT"));
                record.setCaptureMethod("EXCEL_UPLOAD");
                record.setApprovalStatus("APPROVED");

                if (data.containsKey("clockIn") && data.get("clockIn") != null) {
                    record.setClockIn(LocalTime.parse(data.get("clockIn").toString()));
                }
                if (data.containsKey("clockOut") && data.get("clockOut") != null) {
                    record.setClockOut(LocalTime.parse(data.get("clockOut").toString()));
                }
                if (data.containsKey("regularHours") && data.get("regularHours") != null) {
                    record.setRegularHours(new BigDecimal(data.get("regularHours").toString()));
                }
                if (data.containsKey("overtimeHours") && data.get("overtimeHours") != null) {
                    record.setOvertimeHours(new BigDecimal(data.get("overtimeHours").toString()));
                }
                if (data.containsKey("remarks")) {
                    record.setRemarks((String) data.get("remarks"));
                }

                savedRecords.add(attendanceRecordRepository.save(record));
            } catch (Exception e) {
                errors.add("Error processing record: " + e.getMessage());
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("saved", savedRecords.size());
        response.put("errors", errors);
        response.put("records", savedRecords);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/direct-entry")
    public ResponseEntity<?> directEntry(@RequestBody Map<String, Object> request) {
        Long employeeId = Long.valueOf(request.get("employeeId").toString());
        String status = (String) request.getOrDefault("status", "PRESENT");
        String dateStr = (String) request.get("date");

        Employee employee = employeeRepository.findById(employeeId).orElse(null);
        if (employee == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Employee not found"));
        }

        LocalDate date = dateStr != null ? LocalDate.parse(dateStr) : LocalDate.now();

        // Check for existing entry to prevent duplicates
        Optional<AttendanceRecord> existing = attendanceRecordRepository.findByEmployeeIdAndAttendanceDate(employeeId, date);
        if (existing.isPresent()) {
            // Update existing record instead of creating duplicate
            AttendanceRecord existingRecord = existing.get();
            existingRecord.setStatus(status);
            existingRecord.setCaptureMethod("MANUAL");
            existingRecord.setApprovalStatus("APPROVED");

            if (status.equals("PRESENT")) {
                existingRecord.setRegularHours(BigDecimal.valueOf(8));
            } else if (status.equals("HALF_DAY")) {
                existingRecord.setRegularHours(BigDecimal.valueOf(4));
            }

            return ResponseEntity.ok(attendanceRecordRepository.save(existingRecord));
        }

        AttendanceRecord record = new AttendanceRecord();
        record.setEmployee(employee);
        record.setAttendanceDate(date);
        record.setStatus(status);
        record.setCaptureMethod("MANUAL");
        record.setApprovalStatus("APPROVED");

        if (status.equals("PRESENT")) {
            record.setRegularHours(BigDecimal.valueOf(8));
        } else if (status.equals("HALF_DAY")) {
            record.setRegularHours(BigDecimal.valueOf(4));
        }

        return ResponseEntity.ok(attendanceRecordRepository.save(record));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return attendanceRecordRepository.findById(id)
            .map(existing -> {
                if (data.containsKey("clockIn")) {
                    String clockInStr = data.get("clockIn") != null ? data.get("clockIn").toString().trim() : "";
                    existing.setClockIn(clockInStr.isEmpty() ? null : LocalTime.parse(clockInStr));
                }
                if (data.containsKey("clockOut")) {
                    String clockOutStr = data.get("clockOut") != null ? data.get("clockOut").toString().trim() : "";
                    existing.setClockOut(clockOutStr.isEmpty() ? null : LocalTime.parse(clockOutStr));
                }
                if (data.containsKey("status") && data.get("status") != null) {
                    existing.setStatus(data.get("status").toString());
                }
                if (data.containsKey("remarks") && data.get("remarks") != null) {
                    existing.setRemarks(data.get("remarks").toString());
                }
                
                if (existing.getClockIn() != null && existing.getClockOut() != null) {
                    long minutesWorked = ChronoUnit.MINUTES.between(existing.getClockIn(), existing.getClockOut());
                    BigDecimal hoursWorked = BigDecimal.valueOf(minutesWorked / 60.0);
                    
                    AttendanceRule rule = attendanceRuleRepository.findByIsDefaultTrue().orElse(null);
                    BigDecimal regularHoursLimit = rule != null && rule.getRegularHoursPerDay() != null
                        ? rule.getRegularHoursPerDay()
                        : BigDecimal.valueOf(8);
                    
                    if (rule != null && rule.getAutoDeductBreak() != null && rule.getAutoDeductBreak() && rule.getBreakDurationMinutes() != null) {
                        BigDecimal breakHours = rule.getBreakDurationMinutes().divide(BigDecimal.valueOf(60), 2, java.math.RoundingMode.HALF_UP);
                        hoursWorked = hoursWorked.subtract(breakHours);
                        existing.setBreakDuration(rule.getBreakDurationMinutes());
                    }
                    
                    if (hoursWorked.compareTo(regularHoursLimit) > 0) {
                        existing.setRegularHours(regularHoursLimit);
                        existing.setOvertimeHours(hoursWorked.subtract(regularHoursLimit));
                    } else {
                        existing.setRegularHours(hoursWorked.compareTo(BigDecimal.ZERO) > 0 ? hoursWorked : BigDecimal.ZERO);
                        existing.setOvertimeHours(BigDecimal.ZERO);
                    }
                }
                
                existing.setCaptureMethod("EDITED");
                return ResponseEntity.ok(attendanceRecordRepository.save(existing));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        return attendanceRecordRepository.findById(id)
            .map(record -> {
                record.setApprovalStatus("APPROVED");
                record.setApprovedAt(LocalDateTime.now());
                if (request.containsKey("approverId")) {
                    Long approverId = Long.valueOf(request.get("approverId").toString());
                    employeeRepository.findById(approverId).ifPresent(record::setApprovedBy);
                }
                return ResponseEntity.ok(attendanceRecordRepository.save(record));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/bulk-approve")
    public ResponseEntity<?> bulkApprove(@RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<Number> ids = (List<Number>) request.get("ids");
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No IDs provided"));
        }

        Long approverId = null;
        if (request.containsKey("approverId")) {
            approverId = Long.valueOf(request.get("approverId").toString());
        }
        Employee approver = approverId != null ? employeeRepository.findById(approverId).orElse(null) : null;

        List<AttendanceRecord> approved = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        List<String> skipped = new ArrayList<>();

        for (Number idNum : ids) {
            Long id = idNum.longValue();
            Optional<AttendanceRecord> optRecord = attendanceRecordRepository.findById(id);
            
            if (optRecord.isEmpty()) {
                errors.add("Record not found: " + id);
                continue;
            }
            
            AttendanceRecord record = optRecord.get();
            
            if ("APPROVED".equals(record.getApprovalStatus())) {
                skipped.add("Already approved: " + id);
                continue;
            }
            
            if ("REJECTED".equals(record.getApprovalStatus())) {
                skipped.add("Already rejected, cannot approve: " + id);
                continue;
            }
            
            record.setApprovalStatus("APPROVED");
            record.setApprovedAt(LocalDateTime.now());
            if (approver != null) {
                record.setApprovedBy(approver);
            }
            approved.add(attendanceRecordRepository.save(record));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("approved", approved.size());
        response.put("skipped", skipped.size());
        response.put("errors", errors);
        response.put("skippedDetails", skipped);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        return attendanceRecordRepository.findById(id)
            .map(record -> {
                record.setApprovalStatus("REJECTED");
                record.setApprovedAt(LocalDateTime.now());
                if (request.containsKey("remarks")) {
                    record.setRemarks((String) request.get("remarks"));
                }
                return ResponseEntity.ok(attendanceRecordRepository.save(record));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (attendanceRecordRepository.existsById(id)) {
            attendanceRecordRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/rules")
    public ResponseEntity<List<AttendanceRule>> getAllRules() {
        return ResponseEntity.ok(attendanceRuleRepository.findAll());
    }

    @GetMapping("/rules/{id}")
    public ResponseEntity<AttendanceRule> getRuleById(@PathVariable Long id) {
        return attendanceRuleRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/rules")
    public ResponseEntity<AttendanceRule> createRule(@RequestBody AttendanceRule rule) {
        if (rule.getIsDefault() != null && rule.getIsDefault()) {
            attendanceRuleRepository.findByIsDefaultTrue().ifPresent(existing -> {
                existing.setIsDefault(false);
                attendanceRuleRepository.save(existing);
            });
        }
        return ResponseEntity.ok(attendanceRuleRepository.save(rule));
    }

    @PutMapping("/rules/{id}")
    public ResponseEntity<AttendanceRule> updateRule(@PathVariable Long id, @RequestBody AttendanceRule rule) {
        return attendanceRuleRepository.findById(id)
            .map(existing -> {
                rule.setId(id);
                if (rule.getIsDefault() != null && rule.getIsDefault() && !existing.getIsDefault()) {
                    attendanceRuleRepository.findByIsDefaultTrue().ifPresent(other -> {
                        other.setIsDefault(false);
                        attendanceRuleRepository.save(other);
                    });
                }
                return ResponseEntity.ok(attendanceRuleRepository.save(rule));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/rules/{id}")
    public ResponseEntity<Void> deleteRule(@PathVariable Long id) {
        if (attendanceRuleRepository.existsById(id)) {
            attendanceRuleRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/project-time")
    public ResponseEntity<List<ProjectTimeEntry>> getAllProjectTimeEntries(HttpServletRequest request) {
        Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(request);
        List<ProjectTimeEntry> entries = projectTimeEntryRepository.findAll().stream()
                .filter(e -> e.getEmployee() != null)
                .collect(Collectors.toList());
        return ResponseEntity.ok(entries);
    }

    @GetMapping("/project-time/employee/{employeeId}")
    public ResponseEntity<List<ProjectTimeEntry>> getProjectTimeByEmployee(HttpServletRequest request, @PathVariable Long employeeId) {
     //   Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(request);
//        if (!branchEmployeeIds.contains(employeeId)) {
//            return ResponseEntity.notFound().build();
//        }
        return ResponseEntity.ok(projectTimeEntryRepository.findByEmployeeId(employeeId));
    }

    @GetMapping("/project-time/project/{projectCode}")
    public ResponseEntity<List<ProjectTimeEntry>> getProjectTimeByProject(HttpServletRequest request, @PathVariable String projectCode) {
       // Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(request);
        List<ProjectTimeEntry> entries = projectTimeEntryRepository.findByProjectCode(projectCode).stream()
                .filter(e -> e.getEmployee() != null )
                .collect(Collectors.toList());
        return ResponseEntity.ok(entries);
    }

    @PostMapping("/project-time")
    public ResponseEntity<?> createProjectTimeEntry(@RequestBody ProjectTimeEntry entry) {
        if (entry.getEmployee() == null || entry.getEmployee().getId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Employee ID is required"));
        }

        Employee employee = employeeRepository.findById(entry.getEmployee().getId()).orElse(null);
        if (employee == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Employee not found"));
        }

        entry.setEmployee(employee);
        return ResponseEntity.ok(projectTimeEntryRepository.save(entry));
    }

    @PutMapping("/project-time/{id}")
    public ResponseEntity<?> updateProjectTimeEntry(@PathVariable Long id, @RequestBody ProjectTimeEntry entry) {
        return projectTimeEntryRepository.findById(id)
            .map(existing -> {
                entry.setId(id);
                entry.setEmployee(existing.getEmployee());
                return ResponseEntity.ok(projectTimeEntryRepository.save(entry));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/project-time/{id}/approve")
    public ResponseEntity<?> approveProjectTime(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        return projectTimeEntryRepository.findById(id)
            .map(entry -> {
                entry.setStatus("APPROVED");
                entry.setApprovedAt(LocalDateTime.now());
                if (request.containsKey("approverId")) {
                    Long approverId = Long.valueOf(request.get("approverId").toString());
                    employeeRepository.findById(approverId).ifPresent(entry::setApprovedBy);
                }
                return ResponseEntity.ok(projectTimeEntryRepository.save(entry));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/project-time/{id}")
    public ResponseEntity<Void> deleteProjectTimeEntry(@PathVariable Long id) {
        if (projectTimeEntryRepository.existsById(id)) {
            projectTimeEntryRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/summary/today")
    public ResponseEntity<Map<String, Object>> getTodaySummary(HttpServletRequest request) {
        LocalDate today = LocalDate.now();
        Map<String, Object> summary = new HashMap<>();
        
         Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(request);
        List<AttendanceRecord> todayRecords = attendanceRecordRepository.findByAttendanceDate(today).stream()
                .filter(r -> r.getEmployee() != null )
                .collect(Collectors.toList());

        long present = todayRecords.stream().filter(r -> "PRESENT".equals(r.getStatus())).count();
        long absent = todayRecords.stream().filter(r -> "ABSENT".equals(r.getStatus())).count();
        long onLeave = todayRecords.stream().filter(r -> "ON_LEAVE".equals(r.getStatus())).count();
        long lateArrivals = todayRecords.stream().filter(r -> Boolean.TRUE.equals(r.getLateArrival())).count();

        summary.put("date", today.toString());
        summary.put("present", present);
        summary.put("absent", absent);
        summary.put("onLeave", onLeave);
        summary.put("lateArrivals", lateArrivals);
        summary.put("totalEmployees", branchEmployeeIds.size());

        return ResponseEntity.ok(summary);
    }
}
