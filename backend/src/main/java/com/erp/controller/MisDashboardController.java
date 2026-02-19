package com.erp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.erp.repository.EmployeeRepository;
import com.erp.repository.DepartmentRepository;
import com.erp.repository.PayrollRecordRepository;
import com.erp.repository.PayrollRunRepository;
import com.erp.repository.LeaveRequestRepository;
import com.erp.repository.UserNotificationRepository;
import com.erp.model.PayrollRecord;
import com.erp.model.PayrollRun;
import com.erp.model.Employee;
import com.erp.model.LeaveRequest;
import com.erp.model.UserNotification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/mis-dashboard")
@CrossOrigin(origins = "*")
public class MisDashboardController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DepartmentRepository departmentRepository;
    
    @Autowired
    private PayrollRecordRepository payrollRecordRepository;
    
    @Autowired
    private PayrollRunRepository payrollRunRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private UserNotificationRepository userNotificationRepository;

    @GetMapping("/hr")
    public ResponseEntity<Map<String, Object>> getHRStats() {
        try {
            Map<String, Object> stats = new HashMap<>();

            List<Employee> allEmployees = employeeRepository.findAll();
            LocalDate today = LocalDate.now();
            LocalDate monthStart = today.withDayOfMonth(1);

            long totalHeadcount = allEmployees.size();

            long activeEmployees = allEmployees.stream()
                .filter(e -> Boolean.TRUE.equals(e.getActive()) || "Active".equalsIgnoreCase(e.getEmploymentStatus()))
                .count();

            long onLeave = 0;
            try {
                List<LeaveRequest> todayLeaves = leaveRequestRepository.findApprovedLeavesOnDate(today);
                onLeave = todayLeaves.size();
            } catch (Exception e) {
            }

            long newHiresThisMonth = allEmployees.stream()
                .filter(e -> e.getJoiningDate() != null)
                .filter(e -> !e.getJoiningDate().isBefore(monthStart) && !e.getJoiningDate().isAfter(today))
                .count();

            long exitsThisMonth = allEmployees.stream()
                .filter(e -> {
                    if (e.getResignationDate() != null) {
                        return !e.getResignationDate().isBefore(monthStart) && !e.getResignationDate().isAfter(today);
                    }
                    return false;
                })
                .count();

            LocalDate yearAgo = today.minusMonths(12);
            long exitsLast12Months = allEmployees.stream()
                .filter(e -> e.getResignationDate() != null)
                .filter(e -> !e.getResignationDate().isBefore(yearAgo) && !e.getResignationDate().isAfter(today))
                .count();
            double attritionRate = totalHeadcount > 0 ? Math.round((double) exitsLast12Months / totalHeadcount * 1000.0) / 10.0 : 0;

            double avgTenure = allEmployees.stream()
                .filter(e -> Boolean.TRUE.equals(e.getActive()) && e.getJoiningDate() != null)
                .mapToDouble(e -> {
                    long months = ChronoUnit.MONTHS.between(e.getJoiningDate(), today);
                    return months / 12.0;
                })
                .average()
                .orElse(0.0);
            avgTenure = Math.round(avgTenure * 10.0) / 10.0;

            stats.put("totalHeadcount", totalHeadcount);
            stats.put("activeEmployees", activeEmployees);
            stats.put("onLeave", onLeave);
            stats.put("newHiresThisMonth", newHiresThisMonth);
            stats.put("exitsThisMonth", exitsThisMonth);
            stats.put("attritionRate", attritionRate);
            stats.put("avgTenure", avgTenure);

            Map<String, Object> genderDiversity = new HashMap<>();
            long maleCount = allEmployees.stream().filter(e -> "Male".equalsIgnoreCase(e.getGender())).count();
            long femaleCount = allEmployees.stream().filter(e -> "Female".equalsIgnoreCase(e.getGender())).count();
            long otherCount = totalHeadcount - maleCount - femaleCount;
            genderDiversity.put("male", maleCount);
            genderDiversity.put("female", femaleCount);
            genderDiversity.put("other", Math.max(0, otherCount));
            stats.put("genderDiversity", genderDiversity);

            try {
                Map<String, Long> deptMap = allEmployees.stream()
                    .filter(e -> e.getDepartment() != null)
                    .collect(Collectors.groupingBy(e -> e.getDepartment().getName(), Collectors.counting()));
                List<Map<String, Object>> deptDistribution = deptMap.entrySet().stream()
                    .map(entry -> {
                        Map<String, Object> d = new HashMap<>();
                        d.put("department", entry.getKey());
                        d.put("count", entry.getValue());
                        return d;
                    })
                    .sorted((a, b) -> Long.compare((Long) b.get("count"), (Long) a.get("count")))
                    .collect(Collectors.toList());
                if (deptDistribution.isEmpty()) {
                    deptDistribution.add(Map.of("department", "No Departments", "count", 0L));
                }
                stats.put("departmentDistribution", deptDistribution);
            } catch (Exception e) {
                stats.put("departmentDistribution", List.of(Map.of("department", "No Departments", "count", 0L)));
            }

            try {
                DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM");
                List<Map<String, Object>> hiringTrend = new ArrayList<>();
                for (int i = 5; i >= 0; i--) {
                    LocalDate monthDate = today.minusMonths(i);
                    LocalDate mStart = monthDate.withDayOfMonth(1);
                    LocalDate mEnd = monthDate.withDayOfMonth(monthDate.lengthOfMonth());
                    String monthName = monthDate.format(monthFormatter);

                    long hires = allEmployees.stream()
                        .filter(e -> e.getJoiningDate() != null)
                        .filter(e -> !e.getJoiningDate().isBefore(mStart) && !e.getJoiningDate().isAfter(mEnd))
                        .count();

                    long exits = allEmployees.stream()
                        .filter(e -> e.getResignationDate() != null)
                        .filter(e -> !e.getResignationDate().isBefore(mStart) && !e.getResignationDate().isAfter(mEnd))
                        .count();

                    Map<String, Object> entry = new HashMap<>();
                    entry.put("month", monthName);
                    entry.put("hires", hires);
                    entry.put("exits", exits);
                    hiringTrend.add(entry);
                }
                stats.put("monthlyHiringTrend", hiringTrend);
            } catch (Exception e) {
                stats.put("monthlyHiringTrend", List.of());
            }

            try {
                List<Map<String, Object>> ageDistribution = new ArrayList<>();
                long age18_25 = 0, age26_35 = 0, age36_45 = 0, age46_55 = 0, age55plus = 0;
                for (Employee emp : allEmployees) {
                    if (emp.getDateOfBirth() != null) {
                        int age = Period.between(emp.getDateOfBirth(), today).getYears();
                        if (age >= 18 && age <= 25) age18_25++;
                        else if (age <= 35) age26_35++;
                        else if (age <= 45) age36_45++;
                        else if (age <= 55) age46_55++;
                        else age55plus++;
                    }
                }
                ageDistribution.add(createCountMap("18-25", age18_25));
                ageDistribution.add(createCountMap("26-35", age26_35));
                ageDistribution.add(createCountMap("36-45", age36_45));
                ageDistribution.add(createCountMap("46-55", age46_55));
                ageDistribution.add(createCountMap("55+", age55plus));
                stats.put("ageDistribution", ageDistribution);
            } catch (Exception e) {
                stats.put("ageDistribution", List.of());
            }

            try {
                Map<String, Long> empTypeMap = allEmployees.stream()
                    .filter(e -> e.getEmploymentType() != null && !e.getEmploymentType().isEmpty())
                    .collect(Collectors.groupingBy(Employee::getEmploymentType, Collectors.counting()));
                List<Map<String, Object>> empTypes = empTypeMap.entrySet().stream()
                    .map(entry -> {
                        Map<String, Object> m = new HashMap<>();
                        m.put("type", entry.getKey());
                        m.put("count", entry.getValue());
                        return m;
                    })
                    .sorted((a, b) -> Long.compare((Long) b.get("count"), (Long) a.get("count")))
                    .collect(Collectors.toList());
                if (empTypes.isEmpty()) {
                    empTypes.add(Map.of("type", "Not Specified", "count", totalHeadcount));
                }
                stats.put("employmentTypeDistribution", empTypes);
            } catch (Exception e) {
                stats.put("employmentTypeDistribution", List.of());
            }

            return ResponseEntity.ok(stats);
        } catch (Exception ex) {
            return ResponseEntity.ok(getFallbackHRStats());
        }
    }

    private Map<String, Object> createCountMap(String range, long count) {
        Map<String, Object> m = new HashMap<>();
        m.put("range", range);
        m.put("count", count);
        return m;
    }

    private Map<String, Object> getFallbackHRStats() {
        Map<String, Object> stats = new HashMap<>();
        long totalEmployees = employeeRepository.count();
        stats.put("totalHeadcount", totalEmployees);
        stats.put("activeEmployees", totalEmployees);
        stats.put("onLeave", 0);
        stats.put("newHiresThisMonth", 0);
        stats.put("exitsThisMonth", 0);
        stats.put("attritionRate", 0.0);
        stats.put("avgTenure", 0.0);
        stats.put("genderDiversity", Map.of("male", 0, "female", 0, "other", 0));
        stats.put("departmentDistribution", List.of(Map.of("department", "All", "count", totalEmployees)));
        stats.put("monthlyHiringTrend", List.of());
        stats.put("ageDistribution", List.of());
        stats.put("employmentTypeDistribution", List.of());
        return stats;
    }

    @GetMapping("/hr/recent-activities")
    public ResponseEntity<List<Map<String, Object>>> getHRRecentActivities() {
        try {
            List<Map<String, Object>> activities = new ArrayList<>();

            List<UserNotification> allNotifications = userNotificationRepository.findAll();

            allNotifications.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
            List<UserNotification> recent = allNotifications.stream().limit(10).collect(Collectors.toList());

            for (UserNotification notification : recent) {
                Map<String, Object> activity = new HashMap<>();
                activity.put("message", notification.getMessage() != null ? notification.getMessage() : notification.getTitle());
                activity.put("type", mapNotificationType(notification.getType()));
                activity.put("icon", getIconForType(notification.getType()));
                activity.put("time", formatTimeAgo(notification.getCreatedAt()));
                activities.add(activity);
            }

            if (activities.isEmpty()) {
                List<Employee> recentEmployees = employeeRepository.findAll();
                recentEmployees.sort((a, b) -> {
                    LocalDate da = a.getJoiningDate() != null ? a.getJoiningDate() : LocalDate.MIN;
                    LocalDate db = b.getJoiningDate() != null ? b.getJoiningDate() : LocalDate.MIN;
                    return db.compareTo(da);
                });

                for (Employee emp : recentEmployees.stream().limit(5).collect(Collectors.toList())) {
                    Map<String, Object> activity = new HashMap<>();
                    String deptName = emp.getDepartment() != null ? emp.getDepartment().getName() : "the company";
                    activity.put("message", emp.getFirstName() + " " + emp.getLastName() + " joined " + deptName);
                    activity.put("type", "hire");
                    activity.put("icon", "fas fa-user-plus");
                    activity.put("time", formatTimeAgo(emp.getJoiningDate() != null ? emp.getJoiningDate().atStartOfDay() : java.time.LocalDateTime.now()));
                    activities.add(activity);
                }
            }

            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    private String mapNotificationType(String type) {
        if (type == null) return "info";
        switch (type.toUpperCase()) {
            case "LEAVE": return "leave";
            case "PAYROLL": return "payroll";
            case "RECRUITMENT": return "offer";
            case "ONBOARDING": return "hire";
            case "TRAINING": return "training";
            case "PROJECT": return "project";
            case "EMPLOYEE": return "hire";
            case "ATTENDANCE": return "attendance";
            default: return "info";
        }
    }

    private String getIconForType(String type) {
        if (type == null) return "fas fa-info-circle";
        switch (type.toUpperCase()) {
            case "LEAVE": return "fas fa-calendar-check";
            case "PAYROLL": return "fas fa-money-check-alt";
            case "RECRUITMENT": return "fas fa-file-alt";
            case "ONBOARDING": return "fas fa-user-plus";
            case "TRAINING": return "fas fa-graduation-cap";
            case "PROJECT": return "fas fa-project-diagram";
            case "EMPLOYEE": return "fas fa-user-plus";
            case "ATTENDANCE": return "fas fa-user-clock";
            default: return "fas fa-info-circle";
        }
    }

    private String formatTimeAgo(java.time.LocalDateTime dateTime) {
        if (dateTime == null) return "recently";
        long minutes = ChronoUnit.MINUTES.between(dateTime, java.time.LocalDateTime.now());
        if (minutes < 1) return "just now";
        if (minutes < 60) return minutes + " min ago";
        long hours = minutes / 60;
        if (hours < 24) return hours + (hours == 1 ? " hour ago" : " hours ago");
        long days = hours / 24;
        if (days < 30) return days + (days == 1 ? " day ago" : " days ago");
        long months = days / 30;
        return months + (months == 1 ? " month ago" : " months ago");
    }

    @GetMapping("/payroll")
    public ResponseEntity<Map<String, Object>> getPayrollStats() {
        Map<String, Object> stats = new HashMap<>();
        
        List<PayrollRecord> allRecords = payrollRecordRepository.findAll();
        List<Employee> employees = employeeRepository.findByActiveTrue();
        
        BigDecimal totalPayrollCost = allRecords.stream()
            .map(r -> r.getGrossPay() != null ? r.getGrossPay() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal avgSalary = employees.isEmpty() ? BigDecimal.ZERO : 
            employees.stream()
                .map(e -> e.getSalary() != null ? e.getSalary() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(employees.size()), 2, java.math.RoundingMode.HALF_UP);
        
        BigDecimal totalDeductions = allRecords.stream()
            .map(r -> r.getTotalDeductions() != null ? r.getTotalDeductions() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalOvertimePay = allRecords.stream()
            .map(r -> r.getOvertimePay() != null ? r.getOvertimePay() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        stats.put("totalPayrollCost", totalPayrollCost.doubleValue());
        stats.put("avgSalary", avgSalary.doubleValue());
        stats.put("totalDeductions", totalDeductions.doubleValue());
        stats.put("totalOvertimePay", totalOvertimePay.doubleValue());
        
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM");
        LocalDate now = LocalDate.now();
        List<Map<String, Object>> payrollTrend = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate monthDate = now.minusMonths(i);
            String monthName = monthDate.format(monthFormatter);
            int year = monthDate.getYear();
            int month = monthDate.getMonthValue();
            
            BigDecimal monthCost = allRecords.stream()
                .filter(r -> r.getPayrollRun() != null && r.getPayrollRun().getPeriodStartDate() != null)
                .filter(r -> r.getPayrollRun().getPeriodStartDate().getYear() == year && 
                            r.getPayrollRun().getPeriodStartDate().getMonthValue() == month)
                .map(r -> r.getGrossPay() != null ? r.getGrossPay() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            Map<String, Object> entry = new HashMap<>();
            entry.put("month", monthName);
            entry.put("cost", monthCost.doubleValue());
            payrollTrend.add(entry);
        }
        stats.put("payrollTrend", payrollTrend);
        
        BigDecimal fedTax = allRecords.stream().map(r -> r.getFederalTax() != null ? r.getFederalTax() : BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal stateTax = allRecords.stream().map(r -> r.getStateTax() != null ? r.getStateTax() : BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal socSec = allRecords.stream().map(r -> r.getSocialSecurityTax() != null ? r.getSocialSecurityTax() : BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal medicare = allRecords.stream().map(r -> r.getMedicareTax() != null ? r.getMedicareTax() : BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal health = allRecords.stream().map(r -> r.getHealthInsurance() != null ? r.getHealthInsurance() : BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal retirement = allRecords.stream().map(r -> r.getRetirement401k() != null ? r.getRetirement401k() : BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add);
        
        List<Map<String, Object>> deductions = Arrays.asList(
            Map.of("category", "Federal Tax", "amount", fedTax.doubleValue()),
            Map.of("category", "State Tax", "amount", stateTax.doubleValue()),
            Map.of("category", "Social Security", "amount", socSec.doubleValue()),
            Map.of("category", "Medicare", "amount", medicare.doubleValue()),
            Map.of("category", "Health Insurance", "amount", health.doubleValue()),
            Map.of("category", "401(k)", "amount", retirement.doubleValue())
        );
        stats.put("deductionsBreakdown", deductions);
        
        List<Map<String, Object>> otTrend = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate monthDate = now.minusMonths(i);
            String monthName = monthDate.format(monthFormatter);
            int year = monthDate.getYear();
            int month = monthDate.getMonthValue();
            
            double monthHours = allRecords.stream()
                .filter(r -> r.getPayrollRun() != null && r.getPayrollRun().getPeriodStartDate() != null)
                .filter(r -> r.getPayrollRun().getPeriodStartDate().getYear() == year && 
                            r.getPayrollRun().getPeriodStartDate().getMonthValue() == month)
                .mapToDouble(r -> r.getOvertimeHours() != null ? r.getOvertimeHours().doubleValue() : 0)
                .sum();
            
            BigDecimal monthOtCost = allRecords.stream()
                .filter(r -> r.getPayrollRun() != null && r.getPayrollRun().getPeriodStartDate() != null)
                .filter(r -> r.getPayrollRun().getPeriodStartDate().getYear() == year && 
                            r.getPayrollRun().getPeriodStartDate().getMonthValue() == month)
                .map(r -> r.getOvertimePay() != null ? r.getOvertimePay() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            Map<String, Object> entry = new HashMap<>();
            entry.put("month", monthName);
            entry.put("hours", (int) monthHours);
            entry.put("cost", monthOtCost.doubleValue());
            otTrend.add(entry);
        }
        stats.put("overtimeTrend", otTrend);
        
        Map<String, BigDecimal> deptPayrollMap = employees.stream()
            .filter(e -> e.getDepartment() != null)
            .collect(Collectors.groupingBy(
                e -> e.getDepartment().getName(),
                Collectors.mapping(
                    e -> e.getSalary() != null ? e.getSalary() : BigDecimal.ZERO,
                    Collectors.reducing(BigDecimal.ZERO, BigDecimal::add)
                )
            ));
        
        List<Map<String, Object>> deptPayroll = deptPayrollMap.entrySet().stream()
            .map(entry -> {
                Map<String, Object> m = new HashMap<>();
                m.put("department", entry.getKey());
                m.put("cost", entry.getValue().doubleValue());
                return m;
            })
            .collect(Collectors.toList());
        if (deptPayroll.isEmpty()) {
            deptPayroll = Arrays.asList(
                Map.of("department", "No Data", "cost", 0)
            );
        }
        stats.put("departmentPayroll", deptPayroll);
        
        long count30_50 = employees.stream().filter(e -> e.getSalary() != null && 
            e.getSalary().compareTo(BigDecimal.valueOf(30000)) >= 0 && 
            e.getSalary().compareTo(BigDecimal.valueOf(50000)) < 0).count();
        long count50_75 = employees.stream().filter(e -> e.getSalary() != null && 
            e.getSalary().compareTo(BigDecimal.valueOf(50000)) >= 0 && 
            e.getSalary().compareTo(BigDecimal.valueOf(75000)) < 0).count();
        long count75_100 = employees.stream().filter(e -> e.getSalary() != null && 
            e.getSalary().compareTo(BigDecimal.valueOf(75000)) >= 0 && 
            e.getSalary().compareTo(BigDecimal.valueOf(100000)) < 0).count();
        long count100_150 = employees.stream().filter(e -> e.getSalary() != null && 
            e.getSalary().compareTo(BigDecimal.valueOf(100000)) >= 0 && 
            e.getSalary().compareTo(BigDecimal.valueOf(150000)) < 0).count();
        long count150plus = employees.stream().filter(e -> e.getSalary() != null && 
            e.getSalary().compareTo(BigDecimal.valueOf(150000)) >= 0).count();
        
        List<Map<String, Object>> salaryDist = Arrays.asList(
            Map.of("range", "$30-50K", "count", count30_50),
            Map.of("range", "$50-75K", "count", count50_75),
            Map.of("range", "$75-100K", "count", count75_100),
            Map.of("range", "$100-150K", "count", count100_150),
            Map.of("range", "$150K+", "count", count150plus)
        );
        stats.put("salaryDistribution", salaryDist);
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/attendance")
    public ResponseEntity<Map<String, Object>> getAttendanceStats() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("presentToday", 138);
        stats.put("absentToday", 6);
        stats.put("onLeaveToday", 12);
        stats.put("lateArrivals", 8);
        stats.put("avgAttendanceRate", 94.2);
        stats.put("totalOvertimeHours", 485);
        
        List<Map<String, Object>> attendanceTrend = Arrays.asList(
            Map.of("date", "Mon", "present", 142, "absent", 4, "leave", 10),
            Map.of("date", "Tue", "present", 140, "absent", 6, "leave", 10),
            Map.of("date", "Wed", "present", 145, "absent", 3, "leave", 8),
            Map.of("date", "Thu", "present", 138, "absent", 6, "leave", 12),
            Map.of("date", "Fri", "present", 135, "absent", 8, "leave", 13)
        );
        stats.put("attendanceTrend", attendanceTrend);
        
        List<Map<String, Object>> leaveTypes = Arrays.asList(
            Map.of("type", "Annual Leave", "count", 45),
            Map.of("type", "Sick Leave", "count", 28),
            Map.of("type", "Personal", "count", 15),
            Map.of("type", "Maternity/Paternity", "count", 5),
            Map.of("type", "Unpaid Leave", "count", 3)
        );
        stats.put("leaveTypeDistribution", leaveTypes);
        
        List<Map<String, Object>> deptAttendance = Arrays.asList(
            Map.of("department", "Engineering", "rate", 96.5),
            Map.of("department", "Sales", "rate", 92.3),
            Map.of("department", "Marketing", "rate", 94.8),
            Map.of("department", "HR", "rate", 98.2),
            Map.of("department", "Finance", "rate", 95.4),
            Map.of("department", "Operations", "rate", 91.7)
        );
        stats.put("departmentAttendance", deptAttendance);
        
        List<Map<String, Object>> otSummary = Arrays.asList(
            Map.of("department", "Engineering", "hours", 180),
            Map.of("department", "Operations", "hours", 120),
            Map.of("department", "Sales", "hours", 85),
            Map.of("department", "Finance", "hours", 55),
            Map.of("department", "Marketing", "hours", 30),
            Map.of("department", "HR", "hours", 15)
        );
        stats.put("overtimeSummary", otSummary);
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/performance")
    public ResponseEntity<Map<String, Object>> getPerformanceStats() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("highPerformers", 28);
        stats.put("avgPerformanceScore", 3.8);
        stats.put("pendingAppraisals", 15);
        stats.put("completedAppraisals", 141);
        
        List<Map<String, Object>> topPerformers = Arrays.asList(
            Map.of("name", "Sarah Johnson", "department", "Engineering", "score", 4.9, "designation", "Senior Developer"),
            Map.of("name", "Michael Chen", "department", "Sales", "score", 4.8, "designation", "Sales Manager"),
            Map.of("name", "Emily Davis", "department", "Marketing", "score", 4.7, "designation", "Marketing Lead"),
            Map.of("name", "James Wilson", "department", "Engineering", "score", 4.6, "designation", "Tech Lead"),
            Map.of("name", "Lisa Anderson", "department", "Finance", "score", 4.5, "designation", "Finance Manager")
        );
        stats.put("topPerformers", topPerformers);
        
        List<Map<String, Object>> perfDist = Arrays.asList(
            Map.of("rating", "Exceptional", "count", 28),
            Map.of("rating", "Exceeds", "count", 45),
            Map.of("rating", "Meets", "count", 62),
            Map.of("rating", "Needs Improvement", "count", 18),
            Map.of("rating", "Unsatisfactory", "count", 3)
        );
        stats.put("performanceDistribution", perfDist);
        
        List<Map<String, Object>> appraisalTrend = Arrays.asList(
            Map.of("quarter", "Q1 2024", "avgScore", 3.6),
            Map.of("quarter", "Q2 2024", "avgScore", 3.7),
            Map.of("quarter", "Q3 2024", "avgScore", 3.7),
            Map.of("quarter", "Q4 2024", "avgScore", 3.8)
        );
        stats.put("appraisalTrend", appraisalTrend);
        
        List<Map<String, Object>> deptPerf = Arrays.asList(
            Map.of("department", "Engineering", "avgScore", 4.1),
            Map.of("department", "Finance", "avgScore", 3.9),
            Map.of("department", "HR", "avgScore", 3.8),
            Map.of("department", "Marketing", "avgScore", 3.7),
            Map.of("department", "Sales", "avgScore", 3.6),
            Map.of("department", "Operations", "avgScore", 3.4)
        );
        stats.put("departmentPerformance", deptPerf);
        
        List<Map<String, Object>> gradePerf = Arrays.asList(
            Map.of("grade", "E1", "avgScore", 3.4),
            Map.of("grade", "E2", "avgScore", 3.6),
            Map.of("grade", "E3", "avgScore", 3.8),
            Map.of("grade", "M1", "avgScore", 4.0),
            Map.of("grade", "M2", "avgScore", 4.2),
            Map.of("grade", "S1", "avgScore", 4.3)
        );
        stats.put("performanceByGrade", gradePerf);
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/report-fields")
    public ResponseEntity<List<Map<String, Object>>> getReportFields() {
        List<Map<String, Object>> fields = Arrays.asList(
            Map.of("id", "emp_code", "name", "Employee Code", "category", "Employee", "dataType", "string"),
            Map.of("id", "emp_name", "name", "Employee Name", "category", "Employee", "dataType", "string"),
            Map.of("id", "email", "name", "Email", "category", "Employee", "dataType", "string"),
            Map.of("id", "phone", "name", "Phone", "category", "Employee", "dataType", "string"),
            Map.of("id", "dob", "name", "Date of Birth", "category", "Employee", "dataType", "date"),
            Map.of("id", "gender", "name", "Gender", "category", "Employee", "dataType", "string"),
            Map.of("id", "department", "name", "Department", "category", "Employment", "dataType", "string"),
            Map.of("id", "designation", "name", "Designation", "category", "Employment", "dataType", "string"),
            Map.of("id", "grade", "name", "Grade", "category", "Employment", "dataType", "string"),
            Map.of("id", "location", "name", "Location", "category", "Employment", "dataType", "string"),
            Map.of("id", "doj", "name", "Date of Joining", "category", "Employment", "dataType", "date"),
            Map.of("id", "emp_type", "name", "Employment Type", "category", "Employment", "dataType", "string"),
            Map.of("id", "status", "name", "Status", "category", "Employment", "dataType", "string"),
            Map.of("id", "manager", "name", "Reporting Manager", "category", "Employment", "dataType", "string"),
            Map.of("id", "basic_salary", "name", "Basic Salary", "category", "Salary", "dataType", "number"),
            Map.of("id", "gross_salary", "name", "Gross Salary", "category", "Salary", "dataType", "number"),
            Map.of("id", "net_salary", "name", "Net Salary", "category", "Salary", "dataType", "number"),
            Map.of("id", "ctc", "name", "CTC", "category", "Salary", "dataType", "number"),
            Map.of("id", "bank_name", "name", "Bank Name", "category", "Bank", "dataType", "string"),
            Map.of("id", "account_no", "name", "Account Number", "category", "Bank", "dataType", "string"),
            Map.of("id", "present_days", "name", "Present Days", "category", "Attendance", "dataType", "number"),
            Map.of("id", "absent_days", "name", "Absent Days", "category", "Attendance", "dataType", "number"),
            Map.of("id", "leave_days", "name", "Leave Days", "category", "Attendance", "dataType", "number"),
            Map.of("id", "overtime_hours", "name", "Overtime Hours", "category", "Attendance", "dataType", "number"),
            Map.of("id", "perf_score", "name", "Performance Score", "category", "Performance", "dataType", "number"),
            Map.of("id", "perf_rating", "name", "Performance Rating", "category", "Performance", "dataType", "string")
        );
        return ResponseEntity.ok(fields);
    }

    @GetMapping("/report-templates")
    public ResponseEntity<List<Map<String, Object>>> getReportTemplates() {
        List<Map<String, Object>> templates = Arrays.asList(
            Map.of("id", 1, "name", "Employee Directory", "description", "Basic employee contact info", 
                   "selectedFields", Arrays.asList("emp_code", "emp_name", "email", "phone", "department"),
                   "sortBy", "emp_name", "sortOrder", "asc", "createdAt", "2024-12-01", "createdBy", "Admin"),
            Map.of("id", 2, "name", "Salary Report", "description", "Employee salary breakdown",
                   "selectedFields", Arrays.asList("emp_code", "emp_name", "department", "basic_salary", "gross_salary", "ctc"),
                   "sortBy", "ctc", "sortOrder", "desc", "createdAt", "2024-12-05", "createdBy", "Admin"),
            Map.of("id", 3, "name", "Attendance Summary", "description", "Monthly attendance overview",
                   "selectedFields", Arrays.asList("emp_code", "emp_name", "present_days", "absent_days", "leave_days", "overtime_hours"),
                   "sortBy", "emp_name", "sortOrder", "asc", "createdAt", "2024-12-10", "createdBy", "Admin")
        );
        return ResponseEntity.ok(templates);
    }
}
