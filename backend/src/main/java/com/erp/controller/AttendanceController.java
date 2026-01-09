package com.erp.controller;

import com.erp.model.AttendanceRecord;
import com.erp.model.AttendanceRule;
import com.erp.model.ProjectTimeEntry;
import com.erp.model.Employee;
import com.erp.repository.AttendanceRecordRepository;
import com.erp.repository.AttendanceRuleRepository;
import com.erp.repository.ProjectTimeEntryRepository;
import com.erp.repository.EmployeeRepository;

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

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    @Autowired
    private AttendanceRecordRepository attendanceRecordRepository;

    @Autowired
    private AttendanceRuleRepository attendanceRuleRepository;

    @Autowired
    private ProjectTimeEntryRepository projectTimeEntryRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @GetMapping
    public ResponseEntity<List<AttendanceRecord>> getAllRecords() {
        return ResponseEntity.ok(attendanceRecordRepository.findAll());
    }
    
    @GetMapping("/employees-for-clock")
    public ResponseEntity<List<Employee>> getEmployeesForClock() {
        return ResponseEntity.ok(employeeRepository.findByActiveTrue());
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<AttendanceRecord>> getByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        return ResponseEntity.ok(attendanceRecordRepository.findByAttendanceDateBetween(start, end));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AttendanceRecord> getById(@PathVariable Long id) {
        return attendanceRecordRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<AttendanceRecord>> getByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(attendanceRecordRepository.findByEmployeeId(employeeId));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<AttendanceRecord>> getByDate(@PathVariable String date) {
        LocalDate localDate = LocalDate.parse(date);
        return ResponseEntity.ok(attendanceRecordRepository.findByAttendanceDate(localDate));
    }

    @GetMapping("/employee/{employeeId}/range")
    public ResponseEntity<List<AttendanceRecord>> getByEmployeeAndDateRange(
            @PathVariable Long employeeId,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        return ResponseEntity.ok(attendanceRecordRepository.findByEmployeeIdAndAttendanceDateBetween(employeeId, start, end));
    }

    @PostMapping("/clock-in")
    public ResponseEntity<?> clockIn(@RequestBody Map<String, Object> request) {
        Long employeeId = Long.valueOf(request.get("employeeId").toString());
        String captureMethod = (String) request.getOrDefault("captureMethod", "WEB");

        Employee employee = employeeRepository.findById(employeeId).orElse(null);
        if (employee == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Employee not found"));
        }

        LocalDate today = LocalDate.now();
        Optional<AttendanceRecord> existing = attendanceRecordRepository.findByEmployeeIdAndAttendanceDate(employeeId, today);
        if (existing.isPresent() && existing.get().getClockIn() != null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Already clocked in today"));
        }

        AttendanceRecord record = existing.orElse(new AttendanceRecord());
        record.setEmployee(employee);
        record.setAttendanceDate(today);
        record.setClockIn(LocalTime.now());
        record.setCaptureMethod(captureMethod);
        record.setStatus("PRESENT");
        record.setApprovalStatus("APPROVED");

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
    }

    @PostMapping("/clock-out")
    public ResponseEntity<?> clockOut(@RequestBody Map<String, Object> request) {
        Long employeeId = Long.valueOf(request.get("employeeId").toString());

        LocalDate today = LocalDate.now();
        Optional<AttendanceRecord> existing = attendanceRecordRepository.findByEmployeeIdAndAttendanceDate(employeeId, today);
        if (existing.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No clock-in record found for today"));
        }

        AttendanceRecord record = existing.get();
        if (record.getClockOut() != null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Already clocked out today"));
        }

        record.setClockOut(LocalTime.now());

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
    public ResponseEntity<?> manualEntry(@RequestBody AttendanceRecord record) {
        if (record.getEmployee() == null || record.getEmployee().getId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Employee ID is required"));
        }

        Employee employee = employeeRepository.findById(record.getEmployee().getId()).orElse(null);
        if (employee == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Employee not found"));
        }

        // Check for existing entry to prevent duplicates
        Optional<AttendanceRecord> existing = attendanceRecordRepository.findByEmployeeIdAndAttendanceDate(
            employee.getId(), record.getAttendanceDate());
        if (existing.isPresent()) {
            // Update existing record instead of creating duplicate
            AttendanceRecord existingRecord = existing.get();
            existingRecord.setClockIn(record.getClockIn());
            existingRecord.setClockOut(record.getClockOut());
            existingRecord.setStatus(record.getStatus());
            existingRecord.setRemarks(record.getRemarks());
            existingRecord.setCaptureMethod("MANUAL");
            existingRecord.setApprovalStatus("PENDING");

            if (record.getClockIn() != null && record.getClockOut() != null) {
                long minutesWorked = ChronoUnit.MINUTES.between(record.getClockIn(), record.getClockOut());
                BigDecimal hoursWorked = BigDecimal.valueOf(minutesWorked / 60.0);
                existingRecord.setRegularHours(hoursWorked.compareTo(BigDecimal.valueOf(8)) > 0 ? BigDecimal.valueOf(8) : hoursWorked);
                existingRecord.setOvertimeHours(hoursWorked.compareTo(BigDecimal.valueOf(8)) > 0 ? hoursWorked.subtract(BigDecimal.valueOf(8)) : BigDecimal.ZERO);
            }

            return ResponseEntity.ok(attendanceRecordRepository.save(existingRecord));
        }

        record.setEmployee(employee);
        record.setCaptureMethod("MANUAL");
        record.setApprovalStatus("PENDING");

        if (record.getClockIn() != null && record.getClockOut() != null) {
            long minutesWorked = ChronoUnit.MINUTES.between(record.getClockIn(), record.getClockOut());
            BigDecimal hoursWorked = BigDecimal.valueOf(minutesWorked / 60.0);
            record.setRegularHours(hoursWorked.compareTo(BigDecimal.valueOf(8)) > 0 ? BigDecimal.valueOf(8) : hoursWorked);
            record.setOvertimeHours(hoursWorked.compareTo(BigDecimal.valueOf(8)) > 0 ? hoursWorked.subtract(BigDecimal.valueOf(8)) : BigDecimal.ZERO);
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
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody AttendanceRecord record) {
        return attendanceRecordRepository.findById(id)
            .map(existing -> {
                record.setId(id);
                record.setEmployee(existing.getEmployee());
                return ResponseEntity.ok(attendanceRecordRepository.save(record));
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
    public ResponseEntity<List<ProjectTimeEntry>> getAllProjectTimeEntries() {
        return ResponseEntity.ok(projectTimeEntryRepository.findAll());
    }

    @GetMapping("/project-time/employee/{employeeId}")
    public ResponseEntity<List<ProjectTimeEntry>> getProjectTimeByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(projectTimeEntryRepository.findByEmployeeId(employeeId));
    }

    @GetMapping("/project-time/project/{projectCode}")
    public ResponseEntity<List<ProjectTimeEntry>> getProjectTimeByProject(@PathVariable String projectCode) {
        return ResponseEntity.ok(projectTimeEntryRepository.findByProjectCode(projectCode));
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
    public ResponseEntity<Map<String, Object>> getTodaySummary() {
        LocalDate today = LocalDate.now();
        Map<String, Object> summary = new HashMap<>();

        long present = attendanceRecordRepository.countPresentByDate(today);
        long absent = attendanceRecordRepository.countAbsentByDate(today);
        long onLeave = attendanceRecordRepository.countOnLeaveByDate(today);
        long lateArrivals = attendanceRecordRepository.countLateArrivalsByDate(today);

        summary.put("date", today.toString());
        summary.put("present", present);
        summary.put("absent", absent);
        summary.put("onLeave", onLeave);
        summary.put("lateArrivals", lateArrivals);
        summary.put("totalEmployees", employeeRepository.count());

        return ResponseEntity.ok(summary);
    }
}
