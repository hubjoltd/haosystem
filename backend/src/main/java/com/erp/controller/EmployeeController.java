package com.erp.controller;

import com.erp.model.*;
import com.erp.repository.*;
import com.erp.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.time.LocalDateTime;
import java.util.List;

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
            return employeeRepository.findAllByOrderByIdDesc();
        }
        Long branchId = extractBranchId(request);
        if (branchId != null) {
            return employeeRepository.findByBranchIdOrderByIdDesc(branchId);
        }
        return employeeRepository.findAllByOrderByIdDesc();
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

    @PostMapping
    public Employee create(@RequestBody Employee employee, Authentication auth, HttpServletRequest request) {
        employee.setCreatedBy(auth != null ? auth.getName() : "system");
        Long branchId = extractBranchId(request);
        if (branchId != null && employee.getBranch() == null) {
            branchRepository.findById(branchId).ifPresent(employee::setBranch);
        }
        return employeeRepository.save(employee);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Employee> update(@PathVariable Long id, @RequestBody Employee employee, Authentication auth, HttpServletRequest request) {
        Long branchId = extractBranchId(request);
        return employeeRepository.findById(id)
                .filter(existing -> isSuperAdmin(request) || branchId == null || 
                       (existing.getBranch() != null && existing.getBranch().getId().equals(branchId)))
                .map(existing -> {
                    employee.setId(id);
                    employee.setCreatedAt(existing.getCreatedAt());
                    employee.setCreatedBy(existing.getCreatedBy());
                    employee.setBranch(existing.getBranch());
                    employee.setUpdatedBy(auth != null ? auth.getName() : "system");
                    return ResponseEntity.ok(employeeRepository.save(employee));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, HttpServletRequest request) {
        Long branchId = extractBranchId(request);
        return employeeRepository.findById(id)
                .filter(existing -> isSuperAdmin(request) || branchId == null || 
                       (existing.getBranch() != null && existing.getBranch().getId().equals(branchId)))
                .map(employee -> {
                    employeeRepository.delete(employee);
                    return ResponseEntity.ok().<Void>build();
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
    public ResponseEntity<EmployeeBankDetail> updateBankDetail(@PathVariable Long id, @RequestBody EmployeeBankDetail detail) {
        return bankDetailRepository.findById(id)
                .map(existing -> {
                    detail.setId(id);
                    detail.setEmployee(existing.getEmployee());
                    detail.setCreatedAt(existing.getCreatedAt());
                    return ResponseEntity.ok(bankDetailRepository.save(detail));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/bank-details/{id}")
    public ResponseEntity<Void> deleteBankDetail(@PathVariable Long id) {
        return bankDetailRepository.findById(id)
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
                    return ResponseEntity.ok(salaryRepository.save(salary));
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
    public ResponseEntity<EmployeeEducation> updateEducation(@PathVariable Long id, @RequestBody EmployeeEducation education) {
        return educationRepository.findById(id)
                .map(existing -> {
                    education.setId(id);
                    education.setEmployee(existing.getEmployee());
                    education.setCreatedAt(existing.getCreatedAt());
                    return ResponseEntity.ok(educationRepository.save(education));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/education/{id}")
    public ResponseEntity<Void> deleteEducation(@PathVariable Long id) {
        return educationRepository.findById(id)
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
    public ResponseEntity<EmployeeExperience> updateExperience(@PathVariable Long id, @RequestBody EmployeeExperience experience) {
        return experienceRepository.findById(id)
                .map(existing -> {
                    experience.setId(id);
                    experience.setEmployee(existing.getEmployee());
                    experience.setCreatedAt(existing.getCreatedAt());
                    return ResponseEntity.ok(experienceRepository.save(experience));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/experience/{id}")
    public ResponseEntity<Void> deleteExperience(@PathVariable Long id) {
        return experienceRepository.findById(id)
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
    public ResponseEntity<EmployeeAsset> updateAsset(@PathVariable Long id, @RequestBody EmployeeAsset asset) {
        return assetRepository.findById(id)
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
    public ResponseEntity<EmployeeAsset> approveAsset(@PathVariable Long id, @RequestParam String status, Authentication auth) {
        return assetRepository.findById(id)
                .map(asset -> {
                    asset.setApprovalStatus(status);
                    asset.setApprovedBy(auth != null ? auth.getName() : "admin");
                    asset.setApprovedAt(LocalDateTime.now());
                    return ResponseEntity.ok(assetRepository.save(asset));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/assets/{id}")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long id) {
        return assetRepository.findById(id)
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
