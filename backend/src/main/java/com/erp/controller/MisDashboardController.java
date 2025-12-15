package com.erp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.erp.repository.EmployeeRepository;
import com.erp.repository.DepartmentRepository;

import java.util.*;

@RestController
@RequestMapping("/api/mis-dashboard")
@CrossOrigin(origins = "*")
public class MisDashboardController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @GetMapping("/hr")
    public ResponseEntity<Map<String, Object>> getHRStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalEmployees = employeeRepository.count();
        long activeEmployees = totalEmployees > 0 ? (long)(totalEmployees * 0.95) : 0;
        
        stats.put("totalHeadcount", totalEmployees);
        stats.put("activeEmployees", activeEmployees);
        stats.put("onLeave", 8);
        stats.put("newHiresThisMonth", 12);
        stats.put("exitsThisMonth", 3);
        stats.put("attritionRate", 4.2);
        stats.put("avgTenure", 3.5);
        
        Map<String, Object> genderDiversity = new HashMap<>();
        genderDiversity.put("male", 92);
        genderDiversity.put("female", 58);
        genderDiversity.put("other", 6);
        stats.put("genderDiversity", genderDiversity);
        
        List<Map<String, Object>> deptDistribution = new ArrayList<>();
        departmentRepository.findAll().forEach(dept -> {
            Map<String, Object> d = new HashMap<>();
            d.put("department", dept.getName());
            d.put("count", (int)(Math.random() * 40 + 10));
            deptDistribution.add(d);
        });
        if (deptDistribution.isEmpty()) {
            deptDistribution.add(Map.of("department", "Engineering", "count", 45));
            deptDistribution.add(Map.of("department", "Sales", "count", 32));
            deptDistribution.add(Map.of("department", "Marketing", "count", 18));
            deptDistribution.add(Map.of("department", "HR", "count", 12));
            deptDistribution.add(Map.of("department", "Finance", "count", 24));
        }
        stats.put("departmentDistribution", deptDistribution);
        
        List<Map<String, Object>> hiringTrend = Arrays.asList(
            Map.of("month", "Jul", "hires", 8, "exits", 2),
            Map.of("month", "Aug", "hires", 10, "exits", 4),
            Map.of("month", "Sep", "hires", 6, "exits", 1),
            Map.of("month", "Oct", "hires", 14, "exits", 3),
            Map.of("month", "Nov", "hires", 9, "exits", 2),
            Map.of("month", "Dec", "hires", 12, "exits", 3)
        );
        stats.put("monthlyHiringTrend", hiringTrend);
        
        List<Map<String, Object>> ageDistribution = Arrays.asList(
            Map.of("range", "18-25", "count", 28),
            Map.of("range", "26-35", "count", 62),
            Map.of("range", "36-45", "count", 38),
            Map.of("range", "46-55", "count", 20),
            Map.of("range", "55+", "count", 8)
        );
        stats.put("ageDistribution", ageDistribution);
        
        List<Map<String, Object>> empTypes = Arrays.asList(
            Map.of("type", "Full-Time", "count", 120),
            Map.of("type", "Part-Time", "count", 15),
            Map.of("type", "Contract", "count", 12),
            Map.of("type", "Intern", "count", 9)
        );
        stats.put("employmentTypeDistribution", empTypes);
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/payroll")
    public ResponseEntity<Map<String, Object>> getPayrollStats() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalPayrollCost", 1250000);
        stats.put("avgSalary", 75000);
        stats.put("totalDeductions", 187500);
        stats.put("totalOvertimePay", 45000);
        
        List<Map<String, Object>> payrollTrend = Arrays.asList(
            Map.of("month", "Jul", "cost", 1180000),
            Map.of("month", "Aug", "cost", 1195000),
            Map.of("month", "Sep", "cost", 1210000),
            Map.of("month", "Oct", "cost", 1230000),
            Map.of("month", "Nov", "cost", 1245000),
            Map.of("month", "Dec", "cost", 1250000)
        );
        stats.put("payrollTrend", payrollTrend);
        
        List<Map<String, Object>> deductions = Arrays.asList(
            Map.of("category", "Federal Tax", "amount", 75000),
            Map.of("category", "State Tax", "amount", 37500),
            Map.of("category", "Social Security", "amount", 35000),
            Map.of("category", "Medicare", "amount", 18000),
            Map.of("category", "Health Insurance", "amount", 15000),
            Map.of("category", "401(k)", "amount", 7000)
        );
        stats.put("deductionsBreakdown", deductions);
        
        List<Map<String, Object>> otTrend = Arrays.asList(
            Map.of("month", "Jul", "hours", 420, "cost", 38000),
            Map.of("month", "Aug", "hours", 380, "cost", 35000),
            Map.of("month", "Sep", "hours", 450, "cost", 42000),
            Map.of("month", "Oct", "hours", 520, "cost", 48000),
            Map.of("month", "Nov", "hours", 480, "cost", 44000),
            Map.of("month", "Dec", "hours", 490, "cost", 45000)
        );
        stats.put("overtimeTrend", otTrend);
        
        List<Map<String, Object>> deptPayroll = Arrays.asList(
            Map.of("department", "Engineering", "cost", 450000),
            Map.of("department", "Sales", "cost", 280000),
            Map.of("department", "Marketing", "cost", 150000),
            Map.of("department", "HR", "cost", 120000),
            Map.of("department", "Finance", "cost", 180000),
            Map.of("department", "Operations", "cost", 70000)
        );
        stats.put("departmentPayroll", deptPayroll);
        
        List<Map<String, Object>> salaryDist = Arrays.asList(
            Map.of("range", "$30-50K", "count", 25),
            Map.of("range", "$50-75K", "count", 48),
            Map.of("range", "$75-100K", "count", 42),
            Map.of("range", "$100-150K", "count", 28),
            Map.of("range", "$150K+", "count", 13)
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
