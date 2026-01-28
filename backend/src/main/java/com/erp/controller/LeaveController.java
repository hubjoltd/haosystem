package com.erp.controller;

import com.erp.model.*;
import com.erp.repository.*;
import com.erp.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/leave")
@CrossOrigin(origins = "*")
public class LeaveController {

    @Autowired
    private LeaveTypeRepository leaveTypeRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;

    @Autowired
    private HolidayRepository holidayRepository;

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
        return null;
    }
    
    private Long extractEmployeeId(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtUtil.extractEmployeeId(token);
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

    @GetMapping("/types")
    public ResponseEntity<List<LeaveType>> getAllLeaveTypes() {
        return ResponseEntity.ok(leaveTypeRepository.findAll());
    }

    @GetMapping("/types/active")
    public ResponseEntity<List<LeaveType>> getActiveLeaveTypes() {
        return ResponseEntity.ok(leaveTypeRepository.findByIsActiveTrue());
    }

    @GetMapping("/types/{id}")
    public ResponseEntity<LeaveType> getLeaveTypeById(@PathVariable Long id) {
        return leaveTypeRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/types")
    public ResponseEntity<LeaveType> createLeaveType(@RequestBody LeaveType leaveType) {
        return ResponseEntity.ok(leaveTypeRepository.save(leaveType));
    }

    @PutMapping("/types/{id}")
    public ResponseEntity<LeaveType> updateLeaveType(@PathVariable Long id, @RequestBody LeaveType leaveType) {
        return leaveTypeRepository.findById(id)
            .map(existing -> {
                leaveType.setId(id);
                return ResponseEntity.ok(leaveTypeRepository.save(leaveType));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/types/{id}")
    public ResponseEntity<Void> deleteLeaveType(@PathVariable Long id) {
        if (leaveTypeRepository.existsById(id)) {
            leaveTypeRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/requests")
    public ResponseEntity<List<LeaveRequest>> getAllRequests(HttpServletRequest request) {
        Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(request);
        List<LeaveRequest> requests = leaveRequestRepository.findAll().stream()
                .filter(r -> r.getEmployee() != null && branchEmployeeIds.contains(r.getEmployee().getId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/requests/pending")
    public ResponseEntity<List<LeaveRequest>> getPendingRequests(HttpServletRequest request) {
        Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(request);
        List<LeaveRequest> requests = leaveRequestRepository.findPendingRequests().stream()
                .filter(r -> r.getEmployee() != null && branchEmployeeIds.contains(r.getEmployee().getId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/requests/{id}")
    public ResponseEntity<LeaveRequest> getRequestById(HttpServletRequest request, @PathVariable Long id) {
        Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(request);
        return leaveRequestRepository.findById(id)
            .filter(r -> r.getEmployee() != null && branchEmployeeIds.contains(r.getEmployee().getId()))
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/requests/employee/{employeeId}")
    public ResponseEntity<List<LeaveRequest>> getRequestsByEmployee(HttpServletRequest request, @PathVariable Long employeeId) {
        Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(request);
        if (!branchEmployeeIds.contains(employeeId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(leaveRequestRepository.findByEmployeeId(employeeId));
    }

    @PostMapping("/requests")
    public ResponseEntity<?> createRequest(HttpServletRequest httpRequest, @RequestBody Map<String, Object> requestData) {
        Long employeeId = Long.valueOf(requestData.get("employeeId").toString());
        Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(httpRequest);
        if (!branchEmployeeIds.contains(employeeId)) {
            return ResponseEntity.notFound().build();
        }
        Long leaveTypeId = Long.valueOf(requestData.get("leaveTypeId").toString());

        Employee employee = employeeRepository.findById(employeeId).orElse(null);
        LeaveType leaveType = leaveTypeRepository.findById(leaveTypeId).orElse(null);

        if (employee == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Employee not found"));
        }
        if (leaveType == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Leave type not found"));
        }

        LeaveRequest request = new LeaveRequest();
        request.setEmployee(employee);
        request.setLeaveType(leaveType);
        request.setStartDate(LocalDate.parse(requestData.get("startDate").toString()));
        request.setEndDate(LocalDate.parse(requestData.get("endDate").toString()));
        request.setReason((String) requestData.get("reason"));
        request.setDayType((String) requestData.getOrDefault("dayType", "FULL_DAY"));

        Boolean isHourlyLeave = requestData.get("isHourlyLeave") != null && 
            Boolean.parseBoolean(requestData.get("isHourlyLeave").toString());
        request.setIsHourlyLeave(isHourlyLeave);

        BigDecimal totalDays;
        
        if (isHourlyLeave) {
            if (!Boolean.TRUE.equals(leaveType.getAllowHourlyLeave())) {
                return ResponseEntity.badRequest().body(Map.of("error", "This leave type does not allow hourly leave"));
            }
            
            String startTime = (String) requestData.get("startTime");
            String endTime = (String) requestData.get("endTime");
            
            if (startTime == null || endTime == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Start time and end time are required for hourly leave"));
            }
            
            request.setStartTime(java.time.LocalTime.parse(startTime));
            request.setEndTime(java.time.LocalTime.parse(endTime));
            
            long minutes = java.time.Duration.between(request.getStartTime(), request.getEndTime()).toMinutes();
            if (minutes <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "End time must be after start time"));
            }
            BigDecimal totalHours = BigDecimal.valueOf(minutes).divide(BigDecimal.valueOf(60), 2, java.math.RoundingMode.HALF_UP);
            request.setTotalHours(totalHours);
            
            totalDays = totalHours.divide(BigDecimal.valueOf(8), 2, java.math.RoundingMode.HALF_UP);
        } else {
            long daysBetween = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
            long holidays = holidayRepository.countHolidaysBetweenDates(request.getStartDate(), request.getEndDate());
            totalDays = BigDecimal.valueOf(daysBetween - holidays);
            if ("HALF_DAY_AM".equals(request.getDayType()) || "HALF_DAY_PM".equals(request.getDayType())) {
                totalDays = totalDays.subtract(BigDecimal.valueOf(0.5));
            }
        }
        request.setTotalDays(totalDays);

        if (requestData.containsKey("emergencyContact")) {
            request.setEmergencyContact((String) requestData.get("emergencyContact"));
        }

        int currentYear = LocalDate.now().getYear();
        Optional<LeaveBalance> balanceOpt = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(employeeId, leaveTypeId, currentYear);
        if (balanceOpt.isPresent()) {
            LeaveBalance balance = balanceOpt.get();
            if (balance.getAvailableBalance().compareTo(totalDays) < 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Insufficient leave balance", "available", balance.getAvailableBalance(), "requested", totalDays));
            }
            balance.setPending(balance.getPending().add(totalDays));
            leaveBalanceRepository.save(balance);
        }

        LeaveRequest saved = leaveRequestRepository.save(request);

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/requests/{id}/approve")
    public ResponseEntity<?> approveRequest(HttpServletRequest httpRequest, @PathVariable Long id, @RequestBody Map<String, Object> data) {
        Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(httpRequest);
        return leaveRequestRepository.findById(id)
            .filter(r -> r.getEmployee() != null && branchEmployeeIds.contains(r.getEmployee().getId()))
            .map(request -> {
                request.setStatus("APPROVED");
                request.setApprovedAt(LocalDateTime.now());
                if (data.containsKey("approverRemarks")) {
                    request.setApproverRemarks((String) data.get("approverRemarks"));
                }
                if (data.containsKey("approverId")) {
                    Long approverId = Long.valueOf(data.get("approverId").toString());
                    employeeRepository.findById(approverId).ifPresent(request::setApprovedBy);
                }

                int currentYear = request.getStartDate().getYear();
                Optional<LeaveBalance> balanceOpt = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(
                    request.getEmployee().getId(), request.getLeaveType().getId(), currentYear);
                if (balanceOpt.isPresent()) {
                    LeaveBalance balance = balanceOpt.get();
                    balance.setPending(balance.getPending().subtract(request.getTotalDays()));
                    balance.setUsed(balance.getUsed().add(request.getTotalDays()));
                    leaveBalanceRepository.save(balance);
                }

                return ResponseEntity.ok(leaveRequestRepository.save(request));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/requests/{id}/reject")
    public ResponseEntity<?> rejectRequest(HttpServletRequest httpRequest, @PathVariable Long id, @RequestBody Map<String, Object> data) {
        Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(httpRequest);
        return leaveRequestRepository.findById(id)
            .filter(r -> r.getEmployee() != null && branchEmployeeIds.contains(r.getEmployee().getId()))
            .map(request -> {
                request.setStatus("REJECTED");
                request.setApprovedAt(LocalDateTime.now());
                if (data.containsKey("approverRemarks")) {
                    request.setApproverRemarks((String) data.get("approverRemarks"));
                }
                if (data.containsKey("approverId")) {
                    Long approverId = Long.valueOf(data.get("approverId").toString());
                    employeeRepository.findById(approverId).ifPresent(request::setApprovedBy);
                }

                int currentYear = request.getStartDate().getYear();
                Optional<LeaveBalance> balanceOpt = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(
                    request.getEmployee().getId(), request.getLeaveType().getId(), currentYear);
                if (balanceOpt.isPresent()) {
                    LeaveBalance balance = balanceOpt.get();
                    balance.setPending(balance.getPending().subtract(request.getTotalDays()));
                    leaveBalanceRepository.save(balance);
                }

                return ResponseEntity.ok(leaveRequestRepository.save(request));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/requests/{id}/cancel")
    public ResponseEntity<?> cancelRequest(HttpServletRequest httpRequest, @PathVariable Long id) {
        Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(httpRequest);
        return leaveRequestRepository.findById(id)
            .filter(r -> r.getEmployee() != null && branchEmployeeIds.contains(r.getEmployee().getId()))
            .map(request -> {
                if (!"PENDING".equals(request.getStatus()) && !"PENDING_MANAGER".equals(request.getStatus())) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Only pending requests can be cancelled"));
                }

                request.setStatus("CANCELLED");

                int currentYear = request.getStartDate().getYear();
                Optional<LeaveBalance> balanceOpt = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(
                    request.getEmployee().getId(), request.getLeaveType().getId(), currentYear);
                if (balanceOpt.isPresent()) {
                    LeaveBalance balance = balanceOpt.get();
                    balance.setPending(balance.getPending().subtract(request.getTotalDays()));
                    leaveBalanceRepository.save(balance);
                }

                return ResponseEntity.ok(leaveRequestRepository.save(request));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/requests/{id}/manager-approve")
    public ResponseEntity<?> managerApproveRequest(HttpServletRequest httpRequest, @PathVariable Long id, @RequestBody Map<String, Object> data) {
        Long approverId = extractEmployeeId(httpRequest);
        return leaveRequestRepository.findById(id)
            .map(request -> {
                String currentStatus = request.getStatus();
                if (!"PENDING".equals(currentStatus) && !"PENDING_MANAGER".equals(currentStatus)) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Request is not pending manager approval"));
                }

                request.setManagerApprovalStatus("APPROVED");
                request.setManagerApprovedAt(LocalDateTime.now());
                request.setStatus("PENDING_HR");
                if (data.containsKey("remarks")) {
                    request.setManagerRemarks((String) data.get("remarks"));
                }
                if (approverId != null) {
                    employeeRepository.findById(approverId).ifPresent(request::setManagerApprovedBy);
                }

                return ResponseEntity.ok(leaveRequestRepository.save(request));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/requests/{id}/manager-reject")
    public ResponseEntity<?> managerRejectRequest(HttpServletRequest httpRequest, @PathVariable Long id, @RequestBody Map<String, Object> data) {
        Long approverId = extractEmployeeId(httpRequest);
        return leaveRequestRepository.findById(id)
            .map(request -> {
                String currentStatus = request.getStatus();
                if (!"PENDING".equals(currentStatus) && !"PENDING_MANAGER".equals(currentStatus)) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Request is not pending manager approval"));
                }

                request.setManagerApprovalStatus("REJECTED");
                request.setManagerApprovedAt(LocalDateTime.now());
                request.setStatus("REJECTED");
                if (data.containsKey("remarks")) {
                    request.setManagerRemarks((String) data.get("remarks"));
                }
                if (approverId != null) {
                    employeeRepository.findById(approverId).ifPresent(request::setManagerApprovedBy);
                }

                int currentYear = request.getStartDate().getYear();
                Optional<LeaveBalance> balanceOpt = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(
                    request.getEmployee().getId(), request.getLeaveType().getId(), currentYear);
                if (balanceOpt.isPresent()) {
                    LeaveBalance balance = balanceOpt.get();
                    balance.setPending(balance.getPending().subtract(request.getTotalDays()));
                    leaveBalanceRepository.save(balance);
                }

                return ResponseEntity.ok(leaveRequestRepository.save(request));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/requests/{id}/hr-approve")
    public ResponseEntity<?> hrApproveRequest(HttpServletRequest httpRequest, @PathVariable Long id, @RequestBody Map<String, Object> data) {
        Long approverId = extractEmployeeId(httpRequest);
        return leaveRequestRepository.findById(id)
            .map(request -> {
                if (!"PENDING_HR".equals(request.getStatus())) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Request is not pending HR approval"));
                }

                request.setHrApprovalStatus("APPROVED");
                request.setHrApprovedAt(LocalDateTime.now());
                request.setStatus("APPROVED");
                request.setApprovedAt(LocalDateTime.now());
                if (data.containsKey("remarks")) {
                    request.setHrRemarks((String) data.get("remarks"));
                }
                if (approverId != null) {
                    employeeRepository.findById(approverId).ifPresent(emp -> {
                        request.setHrApprovedBy(emp);
                        request.setApprovedBy(emp);
                    });
                }

                int currentYear = request.getStartDate().getYear();
                Optional<LeaveBalance> balanceOpt = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(
                    request.getEmployee().getId(), request.getLeaveType().getId(), currentYear);
                if (balanceOpt.isPresent()) {
                    LeaveBalance balance = balanceOpt.get();
                    balance.setPending(balance.getPending().subtract(request.getTotalDays()));
                    balance.setUsed(balance.getUsed().add(request.getTotalDays()));
                    leaveBalanceRepository.save(balance);
                }

                return ResponseEntity.ok(leaveRequestRepository.save(request));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/requests/{id}/hr-reject")
    public ResponseEntity<?> hrRejectRequest(HttpServletRequest httpRequest, @PathVariable Long id, @RequestBody Map<String, Object> data) {
        Long approverId = extractEmployeeId(httpRequest);
        return leaveRequestRepository.findById(id)
            .map(request -> {
                if (!"PENDING_HR".equals(request.getStatus())) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Request is not pending HR approval"));
                }

                request.setHrApprovalStatus("REJECTED");
                request.setHrApprovedAt(LocalDateTime.now());
                request.setStatus("REJECTED");
                if (data.containsKey("remarks")) {
                    request.setHrRemarks((String) data.get("remarks"));
                }
                if (approverId != null) {
                    employeeRepository.findById(approverId).ifPresent(request::setHrApprovedBy);
                }

                int currentYear = request.getStartDate().getYear();
                Optional<LeaveBalance> balanceOpt = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(
                    request.getEmployee().getId(), request.getLeaveType().getId(), currentYear);
                if (balanceOpt.isPresent()) {
                    LeaveBalance balance = balanceOpt.get();
                    balance.setPending(balance.getPending().subtract(request.getTotalDays()));
                    leaveBalanceRepository.save(balance);
                }

                return ResponseEntity.ok(leaveRequestRepository.save(request));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/requests/{id}")
    public ResponseEntity<Void> deleteRequest(HttpServletRequest httpRequest, @PathVariable Long id) {
        Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(httpRequest);
        return leaveRequestRepository.findById(id)
            .filter(r -> r.getEmployee() != null && branchEmployeeIds.contains(r.getEmployee().getId()))
            .map(request -> {
                leaveRequestRepository.delete(request);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/balances/employee/{employeeId}")
    public ResponseEntity<List<LeaveBalance>> getEmployeeBalances(HttpServletRequest request, @PathVariable Long employeeId) {
        Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(request);
        if (!branchEmployeeIds.contains(employeeId)) {
            return ResponseEntity.notFound().build();
        }
        int currentYear = LocalDate.now().getYear();
        return ResponseEntity.ok(leaveBalanceRepository.findByEmployeeIdAndYear(employeeId, currentYear));
    }

    @GetMapping("/balances/employee/{employeeId}/year/{year}")
    public ResponseEntity<List<LeaveBalance>> getEmployeeBalancesByYear(HttpServletRequest request, @PathVariable Long employeeId, @PathVariable Integer year) {
        Set<Long> branchEmployeeIds = getEmployeeIdsForBranch(request);
        if (!branchEmployeeIds.contains(employeeId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(leaveBalanceRepository.findByEmployeeIdAndYear(employeeId, year));
    }

    @PostMapping("/balances/initialize/{employeeId}")
    public ResponseEntity<?> initializeBalances(@PathVariable Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId).orElse(null);
        if (employee == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Employee not found"));
        }

        int currentYear = LocalDate.now().getYear();
        int previousYear = currentYear - 1;
        List<LeaveType> leaveTypes = leaveTypeRepository.findByIsActiveTrue();
        List<LeaveBalance> balances = new ArrayList<>();

        for (LeaveType leaveType : leaveTypes) {
            Optional<LeaveBalance> existing = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(employeeId, leaveType.getId(), currentYear);
            if (existing.isEmpty()) {
                LeaveBalance balance = new LeaveBalance();
                balance.setEmployee(employee);
                balance.setLeaveType(leaveType);
                balance.setYear(currentYear);
                balance.setCredited(leaveType.getAnnualEntitlement() != null ? leaveType.getAnnualEntitlement() : BigDecimal.ZERO);
                
                // Handle carry-forward from previous year
                if (Boolean.TRUE.equals(leaveType.getCarryForwardAllowed())) {
                    Optional<LeaveBalance> prevYearBalance = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(employeeId, leaveType.getId(), previousYear);
                    if (prevYearBalance.isPresent()) {
                        LeaveBalance prev = prevYearBalance.get();
                        // Calculate carry-forward without subtracting pending (pending should not reduce carry-forward)
                        BigDecimal opening = prev.getOpeningBalance() != null ? prev.getOpeningBalance() : BigDecimal.ZERO;
                        BigDecimal credited = prev.getCredited() != null ? prev.getCredited() : BigDecimal.ZERO;
                        BigDecimal carry = prev.getCarryForward() != null ? prev.getCarryForward() : BigDecimal.ZERO;
                        BigDecimal used = prev.getUsed() != null ? prev.getUsed() : BigDecimal.ZERO;
                        BigDecimal lapsed = prev.getLapsed() != null ? prev.getLapsed() : BigDecimal.ZERO;
                        BigDecimal encashed = prev.getEncashed() != null ? prev.getEncashed() : BigDecimal.ZERO;
                        
                        BigDecimal carryForwardAmount = opening.add(credited).add(carry)
                            .subtract(used).subtract(lapsed).subtract(encashed);
                        
                        if (carryForwardAmount.compareTo(BigDecimal.ZERO) > 0) {
                            // Apply max carry-forward limit if configured
                            if (leaveType.getMaxCarryForward() != null && leaveType.getMaxCarryForward().compareTo(BigDecimal.ZERO) > 0) {
                                carryForwardAmount = carryForwardAmount.min(leaveType.getMaxCarryForward());
                            }
                            balance.setCarryForward(carryForwardAmount);
                        }
                    }
                }
                
                balances.add(leaveBalanceRepository.save(balance));
            }
        }

        return ResponseEntity.ok(Map.of("initialized", balances.size(), "balances", balances));
    }

    @PutMapping("/balances/{id}")
    public ResponseEntity<LeaveBalance> updateBalance(@PathVariable Long id, @RequestBody LeaveBalance balance) {
        return leaveBalanceRepository.findById(id)
            .map(existing -> {
                balance.setId(id);
                balance.setEmployee(existing.getEmployee());
                balance.setLeaveType(existing.getLeaveType());
                balance.setYear(existing.getYear());
                return ResponseEntity.ok(leaveBalanceRepository.save(balance));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/holidays")
    public ResponseEntity<List<Holiday>> getAllHolidays() {
        return ResponseEntity.ok(holidayRepository.findAll());
    }

    @GetMapping("/holidays/year/{year}")
    public ResponseEntity<List<Holiday>> getHolidaysByYear(@PathVariable Integer year) {
        return ResponseEntity.ok(holidayRepository.findByYearAndIsActiveTrue(year));
    }

    @GetMapping("/holidays/{id}")
    public ResponseEntity<Holiday> getHolidayById(@PathVariable Long id) {
        return holidayRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/holidays")
    public ResponseEntity<Holiday> createHoliday(@RequestBody Holiday holiday) {
        if (holiday.getHolidayDate() != null) {
            holiday.setYear(holiday.getHolidayDate().getYear());
            holiday.setDayOfWeek(holiday.getHolidayDate().getDayOfWeek().toString());
        }
        return ResponseEntity.ok(holidayRepository.save(holiday));
    }

    @PutMapping("/holidays/{id}")
    public ResponseEntity<Holiday> updateHoliday(@PathVariable Long id, @RequestBody Holiday holiday) {
        return holidayRepository.findById(id)
            .map(existing -> {
                holiday.setId(id);
                if (holiday.getHolidayDate() != null) {
                    holiday.setYear(holiday.getHolidayDate().getYear());
                    holiday.setDayOfWeek(holiday.getHolidayDate().getDayOfWeek().toString());
                }
                return ResponseEntity.ok(holidayRepository.save(holiday));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/holidays/{id}")
    public ResponseEntity<Void> deleteHoliday(@PathVariable Long id) {
        if (holidayRepository.existsById(id)) {
            holidayRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/holidays/calendar/{year}/{month}")
    public ResponseEntity<Map<String, Object>> getMonthlyCalendar(@PathVariable Integer year, @PathVariable Integer month) {
        LocalDate startOfMonth = LocalDate.of(year, month, 1);
        LocalDate endOfMonth = startOfMonth.plusMonths(1).minusDays(1);

        List<Holiday> holidays = holidayRepository.findByHolidayDateBetween(startOfMonth, endOfMonth);

        Map<String, Object> calendar = new HashMap<>();
        calendar.put("year", year);
        calendar.put("month", month);
        calendar.put("holidays", holidays);

        return ResponseEntity.ok(calendar);
    }

    @GetMapping("/summary/employee/{employeeId}")
    public ResponseEntity<Map<String, Object>> getEmployeeLeaveSummary(@PathVariable Long employeeId) {
        int currentYear = LocalDate.now().getYear();
        List<LeaveBalance> balances = leaveBalanceRepository.findByEmployeeIdAndYear(employeeId, currentYear);
        List<LeaveRequest> requests = leaveRequestRepository.findByEmployeeId(employeeId);

        long pending = requests.stream().filter(r -> "PENDING".equals(r.getStatus())).count();
        long approved = requests.stream().filter(r -> "APPROVED".equals(r.getStatus())).count();
        long rejected = requests.stream().filter(r -> "REJECTED".equals(r.getStatus())).count();

        Map<String, Object> summary = new HashMap<>();
        summary.put("balances", balances);
        summary.put("pendingRequests", pending);
        summary.put("approvedRequests", approved);
        summary.put("rejectedRequests", rejected);
        summary.put("totalRequests", requests.size());

        return ResponseEntity.ok(summary);
    }
}
