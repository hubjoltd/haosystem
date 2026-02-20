package com.erp.controller;

import com.erp.model.*;
import com.erp.repository.*;
import com.erp.security.JwtUtil;
import com.erp.service.UserNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "*")
public class EmployeeController {

    @Autowired
    private EmployeeRepository employeeRepository;
    
    @Autowired
    private EmployeeBankDetailRepository bankDetailRepository;
    
    @Autowired
    private EmployeeSalaryRepository salaryRepository;
    
    @Autowired
    private EmployeeEducationRepository educationRepository;
    
    @Autowired
    private EmployeeExperienceRepository experienceRepository;
    
    @Autowired
    private EmployeeAssetRepository assetRepository;
    
    @Autowired
    private BranchRepository branchRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private UserNotificationService userNotificationService;
    
    @Autowired
    private ProjectMemberRepository projectMemberRepository;
    
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
    
    private boolean canAccessEmployee(Long employeeId, HttpServletRequest request) {
        if (isSuperAdmin(request)) return true;
        Long branchId = extractBranchId(request);
        if (branchId == null) return true;
        return employeeRepository.findById(employeeId)
                .map(emp -> emp.getBranch() != null && emp.getBranch().getId().equals(branchId))
                .orElse(false);
    }

    private void populateProjectFromMembers(List<Employee> employees) {
        for (Employee emp : employees) {
            if (emp.getProject() == null) {
                try {
                    List<ProjectMember> memberships = projectMemberRepository.findByEmployeeId(emp.getId());
                    if (!memberships.isEmpty()) {
                        emp.setProject(memberships.get(0).getProject());
                    }
                } catch (Exception e) {}
            }
        }
    }

    private void populateProjectFromMembers(Employee emp) {
        if (emp != null && emp.getProject() == null) {
            try {
                List<ProjectMember> memberships = projectMemberRepository.findByEmployeeId(emp.getId());
                if (!memberships.isEmpty()) {
                    emp.setProject(memberships.get(0).getProject());
                }
            } catch (Exception e) {}
        }
    }

    @GetMapping
    public List<Employee> getAll(HttpServletRequest request) {
        List<Employee> employees;
        if (isSuperAdmin(request)) {
            employees = employeeRepository.findAllByOrderByIdAsc();
        } else {
            Long branchId = extractBranchId(request);
            if (branchId != null) {
                employees = employeeRepository.findByBranchIdOrderByIdAsc(branchId);
            } else {
                employees = employeeRepository.findAllByOrderByIdAsc();
            }
        }
        populateProjectFromMembers(employees);
        return employees;
    }
    
    @GetMapping("/active")
    public List<Employee> getActiveEmployees(HttpServletRequest request) {
        List<Employee> employees;
        if (isSuperAdmin(request)) {
            employees = employeeRepository.findByActiveTrue();
        } else {
            Long branchId = extractBranchId(request);
            if (branchId != null) {
                employees = employeeRepository.findByBranchIdAndActiveTrue(branchId);
            } else {
                employees = employeeRepository.findByActiveTrue();
            }
        }
        populateProjectFromMembers(employees);
        return employees;
    }
    
    @GetMapping("/search")
    public List<Employee> search(@RequestParam String query, HttpServletRequest request) {
        List<Employee> employees;
        if (isSuperAdmin(request)) {
            employees = employeeRepository.searchEmployees(query);
        } else {
            Long branchId = extractBranchId(request);
            if (branchId != null) {
                employees = employeeRepository.searchEmployeesByBranch(branchId, query);
            } else {
                employees = employeeRepository.searchEmployees(query);
            }
        }
        populateProjectFromMembers(employees);
        return employees;
    }

    @GetMapping("/next-code")
    public ResponseEntity<java.util.Map<String, String>> getNextCode(@RequestParam(required = false) String prefix, HttpServletRequest request) {
        if (prefix == null || prefix.isEmpty()) {
            prefix = "EMP";
        }
        String nextCode = generateEmployeeCode(prefix);
        return ResponseEntity.ok(java.util.Map.of("code", nextCode));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employee> getById(@PathVariable Long id, HttpServletRequest request) {
        Optional<Employee> empOpt;
        if (isSuperAdmin(request)) {
            empOpt = employeeRepository.findById(id);
        } else {
            Long branchId = extractBranchId(request);
            if (branchId != null) {
                empOpt = employeeRepository.findByIdAndBranchId(id, branchId);
            } else {
                empOpt = employeeRepository.findById(id);
            }
        }
        empOpt.ifPresent(this::populateProjectFromMembers);
        return empOpt.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    private String generateEmployeeCode(String prefix) {
        if (prefix == null || prefix.isEmpty()) {
            prefix = "EMP";
        }
        String lastCode = employeeRepository.findLastEmployeeCodeByPrefix(prefix);
        int nextNumber = 1;
        if (lastCode != null && lastCode.length() > prefix.length()) {
            try {
                String numericPart = lastCode.substring(prefix.length()).replaceAll("[^0-9]", "");
                if (!numericPart.isEmpty()) {
                    nextNumber = Integer.parseInt(numericPart) + 1;
                }
            } catch (NumberFormatException e) {
                nextNumber = 1;
            }
        }
        return prefix + "-" + String.format("%04d", nextNumber);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Employee employee, Authentication auth, HttpServletRequest request) {
        try {
            employee.setCreatedBy(auth != null ? auth.getName() : "system");
            Long branchId = extractBranchId(request);
            if (branchId != null && employee.getBranch() == null) {
                branchRepository.findById(branchId).ifPresent(employee::setBranch);
            }
            if (employee.getEmployeeCode() == null || employee.getEmployeeCode().isEmpty()) {
                String prefix = "EMP";
                if (employee.getBranch() != null && employee.getBranch().getCode() != null) {
                    prefix = employee.getBranch().getCode();
                }
                employee.setEmployeeCode(generateEmployeeCode(prefix));
            }
            String loginPassword = employee.getLoginPassword();
            Employee saved = employeeRepository.save(employee);
            if (loginPassword != null && !loginPassword.isEmpty()) {
                try {
                    createOrUpdateUserForEmployee(saved, loginPassword);
                } catch (Exception e) {
                    System.err.println("Error creating user for employee: " + e.getMessage());
                }
            }
            try {
                userNotificationService.notifyAdmins("New Employee Added",
                    saved.getFirstName() + " " + saved.getLastName() + " (" + saved.getEmployeeCode() + ") has been added to the system.",
                    "HR_UPDATE", "Employee", saved.getId());
            } catch (Exception e) {}
            Employee freshEmployee = employeeRepository.findById(saved.getId()).orElse(saved);
            populateProjectFromMembers(freshEmployee);
            return ResponseEntity.ok(freshEmployee);
        } catch (Exception e) {
            System.err.println("Error creating employee: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of("message", "Failed to create employee: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Employee> update(@PathVariable Long id, @RequestBody Employee employee, Authentication auth, HttpServletRequest request) {
        Long branchId = extractBranchId(request);
        return employeeRepository.findById(id)
                .filter(existing -> isSuperAdmin(request) || branchId == null || 
                       (existing.getBranch() != null && existing.getBranch().getId().equals(branchId)))
                .map(existing -> {
                    if (employee.getFirstName() != null) existing.setFirstName(employee.getFirstName());
                    if (employee.getMiddleName() != null) existing.setMiddleName(employee.getMiddleName());
                    if (employee.getLastName() != null) existing.setLastName(employee.getLastName());
                    if (employee.getEmail() != null) existing.setEmail(employee.getEmail());
                    if (employee.getPhone() != null) existing.setPhone(employee.getPhone());
                    if (employee.getAlternatePhone() != null) existing.setAlternatePhone(employee.getAlternatePhone());
                    if (employee.getDateOfBirth() != null) existing.setDateOfBirth(employee.getDateOfBirth());
                    if (employee.getGender() != null) existing.setGender(employee.getGender());
                    if (employee.getMaritalStatus() != null) existing.setMaritalStatus(employee.getMaritalStatus());
                    if (employee.getBloodGroup() != null) existing.setBloodGroup(employee.getBloodGroup());
                    if (employee.getNationality() != null) existing.setNationality(employee.getNationality());
                    if (employee.getProfilePhoto() != null) existing.setProfilePhoto(employee.getProfilePhoto());
                    if (employee.getEmployeeCode() != null) existing.setEmployeeCode(employee.getEmployeeCode());
                    
                    if (employee.getPermanentAddress() != null) existing.setPermanentAddress(employee.getPermanentAddress());
                    if (employee.getPermanentCity() != null) existing.setPermanentCity(employee.getPermanentCity());
                    if (employee.getPermanentState() != null) existing.setPermanentState(employee.getPermanentState());
                    if (employee.getPermanentCountry() != null) existing.setPermanentCountry(employee.getPermanentCountry());
                    if (employee.getPermanentZipCode() != null) existing.setPermanentZipCode(employee.getPermanentZipCode());
                    if (employee.getCurrentAddress() != null) existing.setCurrentAddress(employee.getCurrentAddress());
                    if (employee.getCurrentCity() != null) existing.setCurrentCity(employee.getCurrentCity());
                    if (employee.getCurrentState() != null) existing.setCurrentState(employee.getCurrentState());
                    if (employee.getCurrentCountry() != null) existing.setCurrentCountry(employee.getCurrentCountry());
                    if (employee.getCurrentZipCode() != null) existing.setCurrentZipCode(employee.getCurrentZipCode());
                    
                    if (employee.getEmergencyContactName() != null) existing.setEmergencyContactName(employee.getEmergencyContactName());
                    if (employee.getEmergencyContactRelation() != null) existing.setEmergencyContactRelation(employee.getEmergencyContactRelation());
                    if (employee.getEmergencyContactPhone() != null) existing.setEmergencyContactPhone(employee.getEmergencyContactPhone());
                    
                    if (employee.getDepartment() != null) existing.setDepartment(employee.getDepartment());
                    if (employee.getDesignation() != null) existing.setDesignation(employee.getDesignation());
                    if (employee.getJobRole() != null) existing.setJobRole(employee.getJobRole());
                    if (employee.getGrade() != null) existing.setGrade(employee.getGrade());
                    if (employee.getLocation() != null) existing.setLocation(employee.getLocation());
                    if (employee.getReportingManager() != null) existing.setReportingManager(employee.getReportingManager());
                    if (employee.getCostCenter() != null) existing.setCostCenter(employee.getCostCenter());
                    if (employee.getExpenseCenter() != null) existing.setExpenseCenter(employee.getExpenseCenter());
                    if (employee.getProject() != null) existing.setProject(employee.getProject());
                    
                    if (employee.getJoiningDate() != null) existing.setJoiningDate(employee.getJoiningDate());
                    if (employee.getConfirmationDate() != null) existing.setConfirmationDate(employee.getConfirmationDate());
                    if (employee.getProbationEndDate() != null) existing.setProbationEndDate(employee.getProbationEndDate());
                    if (employee.getResignationDate() != null) existing.setResignationDate(employee.getResignationDate());
                    if (employee.getLastWorkingDate() != null) existing.setLastWorkingDate(employee.getLastWorkingDate());
                    
                    if (employee.getEmploymentType() != null) existing.setEmploymentType(employee.getEmploymentType());
                    if (employee.getEmploymentStatus() != null) existing.setEmploymentStatus(employee.getEmploymentStatus());
                    
                    if (employee.getPanNumber() != null) existing.setPanNumber(employee.getPanNumber());
                    if (employee.getAadharNumber() != null) existing.setAadharNumber(employee.getAadharNumber());
                    if (employee.getPassportNumber() != null) existing.setPassportNumber(employee.getPassportNumber());
                    if (employee.getPassportExpiry() != null) existing.setPassportExpiry(employee.getPassportExpiry());
                    if (employee.getSsn() != null) existing.setSsn(employee.getSsn());
                    if (employee.getNationalId() != null) existing.setNationalId(employee.getNationalId());
                    if (employee.getCitizenship() != null) existing.setCitizenship(employee.getCitizenship());
                    if (employee.getVisaType() != null) existing.setVisaType(employee.getVisaType());
                    if (employee.getVisaExpiry() != null) existing.setVisaExpiry(employee.getVisaExpiry());
                    if (employee.getI9Status() != null) existing.setI9Status(employee.getI9Status());
                    if (employee.getI9ExpiryDate() != null) existing.setI9ExpiryDate(employee.getI9ExpiryDate());
                    if (employee.getWorkAuthorizationType() != null) existing.setWorkAuthorizationType(employee.getWorkAuthorizationType());
                    
                    if (employee.getProbationMonths() != null) existing.setProbationMonths(employee.getProbationMonths());
                    if (employee.getNoticePeriodDays() != null) existing.setNoticePeriodDays(employee.getNoticePeriodDays());
                    if (employee.getSalary() != null) existing.setSalary(employee.getSalary());
                    if (employee.getHourlyRate() != null) existing.setHourlyRate(employee.getHourlyRate());
                    if (employee.getActive() != null) existing.setActive(employee.getActive());
                    
                    existing.setUpdatedBy(auth != null ? auth.getName() : "system");
                    Employee saved = employeeRepository.save(existing);
                    if (employee.getLoginPassword() != null && !employee.getLoginPassword().isEmpty()) {
                        createOrUpdateUserForEmployee(saved, employee.getLoginPassword());
                    }
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    private void createOrUpdateUserForEmployee(Employee employee, String password) {
        String username = employee.getEmployeeCode();
        if (username == null || username.isEmpty()) return;
        
        Optional<User> existingUser = userRepository.findByUsername(username);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setPassword(passwordEncoder.encode(password));
            user.setFirstName(employee.getFirstName());
            user.setLastName(employee.getLastName());
            if (employee.getEmail() != null) user.setEmail(employee.getEmail());
            if (employee.getBranch() != null) user.setBranch(employee.getBranch());
            userRepository.save(user);
        } else {
            Role staffRole = roleRepository.findByName("STAFF")
                .orElseGet(() -> roleRepository.save(new Role("STAFF", "Standard staff member", "read,create,update")));
            
            User user = new User();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(password));
            user.setFirstName(employee.getFirstName());
            user.setLastName(employee.getLastName() != null ? employee.getLastName() : "");
            user.setEmail(employee.getEmail() != null ? employee.getEmail() : username + "@employee.local");
            user.setRole(staffRole);
            user.setActive(true);
            user.setIsSuperAdmin(false);
            user.setCreatedAt(LocalDateTime.now());
            if (employee.getBranch() != null) user.setBranch(employee.getBranch());
            userRepository.save(user);
        }
    }

    @Autowired
    private jakarta.persistence.EntityManager entityManager;

    @DeleteMapping("/{id}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> delete(@PathVariable Long id, HttpServletRequest request) {
        Long branchId = extractBranchId(request);
        return employeeRepository.findById(id)
                .filter(existing -> isSuperAdmin(request) || branchId == null || 
                       (existing.getBranch() != null && existing.getBranch().getId().equals(branchId)))
                .map(employee -> {
                    try {
                        entityManager.createNativeQuery("DELETE FROM employee_bank_details WHERE employee_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("DELETE FROM employee_salaries WHERE employee_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("DELETE FROM employee_education WHERE employee_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("DELETE FROM employee_experience WHERE employee_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("DELETE FROM employee_assets WHERE employee_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("DELETE FROM employee_benefits WHERE employee_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("DELETE FROM employee_documents WHERE employee_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("DELETE FROM leave_requests WHERE employee_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("DELETE FROM leave_balances WHERE employee_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("DELETE FROM attendance_records WHERE employee_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("DELETE FROM payroll_records WHERE employee_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("DELETE FROM project_time_entries WHERE employee_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("DELETE FROM project_timesheets WHERE employee_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("DELETE FROM timesheets WHERE employee_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("DELETE FROM project_members WHERE employee_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("DELETE FROM expense_requests WHERE employee_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("DELETE FROM loan_applications WHERE employee_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("DELETE FROM hr_letters WHERE employee_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("DELETE FROM final_settlements WHERE employee_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("DELETE FROM training_enrollments WHERE employee_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("UPDATE onboarding_tasks SET assigned_to_id = NULL WHERE assigned_to_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("UPDATE onboarding_tasks SET completed_by_id = NULL WHERE completed_by_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("DELETE FROM onboarding_plans WHERE employee_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("UPDATE candidates SET converted_employee_id = NULL WHERE converted_employee_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("UPDATE attendance_records SET approved_by = NULL WHERE approved_by = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("UPDATE leave_requests SET approved_by = NULL WHERE approved_by = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("UPDATE leave_requests SET manager_approved_by = NULL WHERE manager_approved_by = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("UPDATE leave_requests SET hr_approved_by = NULL WHERE hr_approved_by = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("UPDATE employees SET reporting_manager_id = NULL WHERE reporting_manager_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("UPDATE projects SET project_manager_id = NULL WHERE project_manager_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("UPDATE job_requisitions SET requested_by_id = NULL WHERE requested_by_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("UPDATE job_requisitions SET approved_by_id = NULL WHERE approved_by_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("UPDATE job_requisitions SET reporting_to_id = NULL WHERE reporting_to_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("UPDATE interviews SET interviewer_id = NULL WHERE interviewer_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("UPDATE training_sessions SET trainer_id = NULL WHERE trainer_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("UPDATE offer_letters SET approved_by_id = NULL WHERE approved_by_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("UPDATE offer_letters SET reporting_to_id = NULL WHERE reporting_to_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("UPDATE hr_letters SET approved_by_id = NULL WHERE approved_by_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("UPDATE hr_letters SET generated_by_id = NULL WHERE generated_by_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("UPDATE expense_requests SET approver_id = NULL WHERE approver_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("UPDATE payroll_runs SET created_by = NULL WHERE created_by = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("UPDATE payroll_runs SET processed_by = NULL WHERE processed_by = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("UPDATE payroll_runs SET approved_by = NULL WHERE approved_by = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("UPDATE project_time_entries SET approved_by = NULL WHERE approved_by = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("UPDATE project_timesheets SET approved_by = NULL WHERE approved_by = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("UPDATE project_tasks SET assignee_id = NULL WHERE assignee_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("UPDATE timesheets SET approved_by = NULL WHERE approved_by = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("UPDATE onboarding_plans SET buddy_id = NULL WHERE buddy_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("UPDATE onboarding_plans SET manager_id = NULL WHERE manager_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("UPDATE onboarding_plans SET hr_coordinator_id = NULL WHERE hr_coordinator_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("UPDATE candidates SET assigned_recruiter_id = NULL WHERE assigned_recruiter_id = :id").setParameter("id", id).executeUpdate();
                        entityManager.createNativeQuery("UPDATE loan_applications SET approved_by_id = NULL WHERE approved_by_id = :id").setParameter("id", id).executeUpdate();

                        employeeRepository.delete(employee);
                        return ResponseEntity.ok().<Void>build();
                    } catch (Exception e) {
                        java.util.Map<String, String> error = new java.util.HashMap<>();
                        error.put("error", "Failed to delete employee: " + e.getMessage());
                        return ResponseEntity.status(500).body(error);
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{employeeId}/bank-details")
    public ResponseEntity<List<EmployeeBankDetail>> getBankDetails(@PathVariable Long employeeId, HttpServletRequest request) {
        if (!canAccessEmployee(employeeId, request)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(bankDetailRepository.findByEmployeeId(employeeId));
    }
    
    @PostMapping("/{employeeId}/bank-details")
    public ResponseEntity<EmployeeBankDetail> createBankDetail(@PathVariable Long employeeId, @RequestBody EmployeeBankDetail detail, HttpServletRequest request) {
        if (!canAccessEmployee(employeeId, request)) {
            return ResponseEntity.notFound().build();
        }
        return employeeRepository.findById(employeeId)
                .map(emp -> {
                    detail.setEmployee(emp);
                    return ResponseEntity.ok(bankDetailRepository.save(detail));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/bank-details/{id}")
    public ResponseEntity<EmployeeBankDetail> updateBankDetail(@PathVariable Long id, @RequestBody EmployeeBankDetail detail, HttpServletRequest request) {
        return bankDetailRepository.findById(id)
                .filter(existing -> canAccessEmployee(existing.getEmployee().getId(), request))
                .map(existing -> {
                    detail.setId(id);
                    detail.setEmployee(existing.getEmployee());
                    detail.setCreatedAt(existing.getCreatedAt());
                    return ResponseEntity.ok(bankDetailRepository.save(detail));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/bank-details/{id}")
    public ResponseEntity<Void> deleteBankDetail(@PathVariable Long id, HttpServletRequest request) {
        return bankDetailRepository.findById(id)
                .filter(existing -> canAccessEmployee(existing.getEmployee().getId(), request))
                .map(detail -> {
                    bankDetailRepository.delete(detail);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{employeeId}/salary")
    public ResponseEntity<List<EmployeeSalary>> getSalaryHistory(@PathVariable Long employeeId, HttpServletRequest request) {
        if (!canAccessEmployee(employeeId, request)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(salaryRepository.findByEmployeeIdOrderByEffectiveFromDesc(employeeId));
    }
    
    @GetMapping("/{employeeId}/salary/current")
    public ResponseEntity<EmployeeSalary> getCurrentSalary(@PathVariable Long employeeId, HttpServletRequest request) {
        if (!canAccessEmployee(employeeId, request)) {
            return ResponseEntity.notFound().build();
        }
        return salaryRepository.findByEmployeeIdAndIsCurrentTrue(employeeId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/{employeeId}/salary")
    public ResponseEntity<EmployeeSalary> createSalary(@PathVariable Long employeeId, @RequestBody EmployeeSalary salary, Authentication auth, HttpServletRequest request) {
        if (!canAccessEmployee(employeeId, request)) {
            return ResponseEntity.notFound().build();
        }
        return employeeRepository.findById(employeeId)
                .map(emp -> {
                    salaryRepository.findByEmployeeIdAndIsCurrentTrue(employeeId)
                            .ifPresent(current -> {
                                current.setIsCurrent(false);
                                current.setEffectiveTo(salary.getEffectiveFrom().minusDays(1));
                                salaryRepository.save(current);
                            });
                    salary.setEmployee(emp);
                    salary.setIsCurrent(true);
                    salary.setCreatedBy(auth != null ? auth.getName() : "system");
                    EmployeeSalary saved = salaryRepository.save(salary);
                    if (saved.getBasicSalary() != null) {
                        emp.setSalary(saved.getBasicSalary());
                        employeeRepository.save(emp);
                    }
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{employeeId}/education")
    public ResponseEntity<List<EmployeeEducation>> getEducation(@PathVariable Long employeeId, HttpServletRequest request) {
        if (!canAccessEmployee(employeeId, request)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(educationRepository.findByEmployeeId(employeeId));
    }
    
    @PostMapping("/{employeeId}/education")
    public ResponseEntity<EmployeeEducation> createEducation(@PathVariable Long employeeId, @RequestBody EmployeeEducation education, HttpServletRequest request) {
        if (!canAccessEmployee(employeeId, request)) {
            return ResponseEntity.notFound().build();
        }
        return employeeRepository.findById(employeeId)
                .map(emp -> {
                    education.setEmployee(emp);
                    return ResponseEntity.ok(educationRepository.save(education));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/education/{id}")
    public ResponseEntity<EmployeeEducation> updateEducation(@PathVariable Long id, @RequestBody EmployeeEducation education, HttpServletRequest request) {
        return educationRepository.findById(id)
                .filter(existing -> canAccessEmployee(existing.getEmployee().getId(), request))
                .map(existing -> {
                    education.setId(id);
                    education.setEmployee(existing.getEmployee());
                    education.setCreatedAt(existing.getCreatedAt());
                    return ResponseEntity.ok(educationRepository.save(education));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/education/{id}")
    public ResponseEntity<Void> deleteEducation(@PathVariable Long id, HttpServletRequest request) {
        return educationRepository.findById(id)
                .filter(existing -> canAccessEmployee(existing.getEmployee().getId(), request))
                .map(edu -> {
                    educationRepository.delete(edu);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{employeeId}/experience")
    public ResponseEntity<List<EmployeeExperience>> getExperience(@PathVariable Long employeeId, HttpServletRequest request) {
        if (!canAccessEmployee(employeeId, request)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(experienceRepository.findByEmployeeIdOrderByFromDateDesc(employeeId));
    }
    
    @PostMapping("/{employeeId}/experience")
    public ResponseEntity<EmployeeExperience> createExperience(@PathVariable Long employeeId, @RequestBody EmployeeExperience experience, HttpServletRequest request) {
        if (!canAccessEmployee(employeeId, request)) {
            return ResponseEntity.notFound().build();
        }
        return employeeRepository.findById(employeeId)
                .map(emp -> {
                    experience.setEmployee(emp);
                    return ResponseEntity.ok(experienceRepository.save(experience));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/experience/{id}")
    public ResponseEntity<EmployeeExperience> updateExperience(@PathVariable Long id, @RequestBody EmployeeExperience experience, HttpServletRequest request) {
        return experienceRepository.findById(id)
                .filter(existing -> canAccessEmployee(existing.getEmployee().getId(), request))
                .map(existing -> {
                    experience.setId(id);
                    experience.setEmployee(existing.getEmployee());
                    experience.setCreatedAt(existing.getCreatedAt());
                    return ResponseEntity.ok(experienceRepository.save(experience));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/experience/{id}")
    public ResponseEntity<Void> deleteExperience(@PathVariable Long id, HttpServletRequest request) {
        return experienceRepository.findById(id)
                .filter(existing -> canAccessEmployee(existing.getEmployee().getId(), request))
                .map(exp -> {
                    experienceRepository.delete(exp);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{employeeId}/assets")
    public ResponseEntity<List<EmployeeAsset>> getAssets(@PathVariable Long employeeId, HttpServletRequest request) {
        if (!canAccessEmployee(employeeId, request)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(assetRepository.findByEmployeeId(employeeId));
    }
    
    @PostMapping("/{employeeId}/assets")
    public ResponseEntity<EmployeeAsset> createAsset(@PathVariable Long employeeId, @RequestBody EmployeeAsset asset, Authentication auth, HttpServletRequest request) {
        if (!canAccessEmployee(employeeId, request)) {
            return ResponseEntity.notFound().build();
        }
        return employeeRepository.findById(employeeId)
                .map(emp -> {
                    asset.setEmployee(emp);
                    asset.setCreatedBy(auth != null ? auth.getName() : "system");
                    return ResponseEntity.ok(assetRepository.save(asset));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/assets/{id}")
    public ResponseEntity<EmployeeAsset> updateAsset(@PathVariable Long id, @RequestBody EmployeeAsset asset, HttpServletRequest request) {
        return assetRepository.findById(id)
                .filter(existing -> canAccessEmployee(existing.getEmployee().getId(), request))
                .map(existing -> {
                    asset.setId(id);
                    asset.setEmployee(existing.getEmployee());
                    asset.setCreatedAt(existing.getCreatedAt());
                    asset.setCreatedBy(existing.getCreatedBy());
                    return ResponseEntity.ok(assetRepository.save(asset));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/assets/{id}/approve")
    public ResponseEntity<EmployeeAsset> approveAsset(@PathVariable Long id, @RequestParam String status, Authentication auth, HttpServletRequest request) {
        return assetRepository.findById(id)
                .filter(existing -> canAccessEmployee(existing.getEmployee().getId(), request))
                .map(asset -> {
                    asset.setApprovalStatus(status);
                    asset.setApprovedBy(auth != null ? auth.getName() : "admin");
                    asset.setApprovedAt(LocalDateTime.now());
                    return ResponseEntity.ok(assetRepository.save(asset));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/assets/{id}")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long id, HttpServletRequest request) {
        return assetRepository.findById(id)
                .filter(existing -> canAccessEmployee(existing.getEmployee().getId(), request))
                .map(asset -> {
                    assetRepository.delete(asset);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/by-department/{departmentId}")
    public List<Employee> getByDepartment(@PathVariable Long departmentId) {
        return employeeRepository.findByDepartmentId(departmentId);
    }
    
    @GetMapping("/by-designation/{designationId}")
    public List<Employee> getByDesignation(@PathVariable Long designationId) {
        return employeeRepository.findByDesignationId(designationId);
    }
    
    @GetMapping("/by-location/{locationId}")
    public List<Employee> getByLocation(@PathVariable Long locationId) {
        return employeeRepository.findByLocationId(locationId);
    }
    
    @GetMapping("/by-manager/{managerId}")
    public List<Employee> getByManager(@PathVariable Long managerId) {
        return employeeRepository.findByReportingManagerId(managerId);
    }
}
