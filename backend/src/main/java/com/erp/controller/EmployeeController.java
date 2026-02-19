package com.erp.controller;

import com.erp.model.*;
import com.erp.repository.*;
import com.erp.security.JwtUtil;
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

    @GetMapping
    public List<Employee> getAll(HttpServletRequest request) {
        if (isSuperAdmin(request)) {
            return employeeRepository.findAllByOrderByIdAsc();
        }
        Long branchId = extractBranchId(request);
        if (branchId != null) {
            return employeeRepository.findByBranchIdOrderByIdAsc(branchId);
        }
        return employeeRepository.findAllByOrderByIdAsc();
    }
    
    @GetMapping("/active")
    public List<Employee> getActiveEmployees(HttpServletRequest request) {
        if (isSuperAdmin(request)) {
            return employeeRepository.findByActiveTrue();
        }
        Long branchId = extractBranchId(request);
        if (branchId != null) {
            return employeeRepository.findByBranchIdAndActiveTrue(branchId);
        }
        return employeeRepository.findByActiveTrue();
    }
    
    @GetMapping("/search")
    public List<Employee> search(@RequestParam String query, HttpServletRequest request) {
        if (isSuperAdmin(request)) {
            return employeeRepository.searchEmployees(query);
        }
        Long branchId = extractBranchId(request);
        if (branchId != null) {
            return employeeRepository.searchEmployeesByBranch(branchId, query);
        }
        return employeeRepository.searchEmployees(query);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employee> getById(@PathVariable Long id, HttpServletRequest request) {
        if (isSuperAdmin(request)) {
            return employeeRepository.findById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }
        Long branchId = extractBranchId(request);
        if (branchId != null) {
            return employeeRepository.findByIdAndBranchId(id, branchId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }
        return employeeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
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
        return prefix + String.format("%04d", nextNumber);
    }

    @PostMapping
    public Employee create(@RequestBody Employee employee, Authentication auth, HttpServletRequest request) {
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
            createOrUpdateUserForEmployee(saved, loginPassword);
        }
        return saved;
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

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, HttpServletRequest request) {
        Long branchId = extractBranchId(request);
        return employeeRepository.findById(id)
                .filter(existing -> isSuperAdmin(request) || branchId == null || 
                       (existing.getBranch() != null && existing.getBranch().getId().equals(branchId)))
                .map(employee -> {
                    try {
                        bankDetailRepository.findByEmployeeId(id).forEach(bankDetailRepository::delete);
                        salaryRepository.findByEmployeeId(id).forEach(salaryRepository::delete);
                        educationRepository.findByEmployeeId(id).forEach(educationRepository::delete);
                        experienceRepository.findByEmployeeId(id).forEach(experienceRepository::delete);
                        assetRepository.findByEmployeeId(id).forEach(assetRepository::delete);
                        employeeRepository.delete(employee);
                        return ResponseEntity.ok().<Void>build();
                    } catch (Exception e) {
                        java.util.Map<String, String> error = new java.util.HashMap<>();
                        error.put("error", "Failed to delete employee. The employee may have associated records that prevent deletion.");
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
