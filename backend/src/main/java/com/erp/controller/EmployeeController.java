package com.erp.controller;

import com.erp.model.*;
import com.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping
    public List<Employee> getAll() {
        return employeeRepository.findAllByOrderByIdDesc();
    }
    
    @GetMapping("/active")
    public List<Employee> getActiveEmployees() {
        return employeeRepository.findByActiveTrue();
    }
    
    @GetMapping("/search")
    public List<Employee> search(@RequestParam String query) {
        return employeeRepository.searchEmployees(query);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employee> getById(@PathVariable Long id) {
        return employeeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Employee create(@RequestBody Employee employee, Authentication auth) {
        employee.setCreatedBy(auth != null ? auth.getName() : "system");
        return employeeRepository.save(employee);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Employee> update(@PathVariable Long id, @RequestBody Employee employee, Authentication auth) {
        return employeeRepository.findById(id)
                .map(existing -> {
                    employee.setId(id);
                    employee.setCreatedAt(existing.getCreatedAt());
                    employee.setCreatedBy(existing.getCreatedBy());
                    employee.setUpdatedBy(auth != null ? auth.getName() : "system");
                    return ResponseEntity.ok(employeeRepository.save(employee));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return employeeRepository.findById(id)
                .map(employee -> {
                    employeeRepository.delete(employee);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{employeeId}/bank-details")
    public List<EmployeeBankDetail> getBankDetails(@PathVariable Long employeeId) {
        return bankDetailRepository.findByEmployeeId(employeeId);
    }
    
    @PostMapping("/{employeeId}/bank-details")
    public EmployeeBankDetail createBankDetail(@PathVariable Long employeeId, @RequestBody EmployeeBankDetail detail) {
        return employeeRepository.findById(employeeId)
                .map(emp -> {
                    detail.setEmployee(emp);
                    return bankDetailRepository.save(detail);
                })
                .orElseThrow(() -> new RuntimeException("Employee not found"));
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
    public List<EmployeeSalary> getSalaryHistory(@PathVariable Long employeeId) {
        return salaryRepository.findByEmployeeIdOrderByEffectiveFromDesc(employeeId);
    }
    
    @GetMapping("/{employeeId}/salary/current")
    public ResponseEntity<EmployeeSalary> getCurrentSalary(@PathVariable Long employeeId) {
        return salaryRepository.findByEmployeeIdAndIsCurrentTrue(employeeId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/{employeeId}/salary")
    public EmployeeSalary createSalary(@PathVariable Long employeeId, @RequestBody EmployeeSalary salary, Authentication auth) {
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
                    return salaryRepository.save(salary);
                })
                .orElseThrow(() -> new RuntimeException("Employee not found"));
    }
    
    @GetMapping("/{employeeId}/education")
    public List<EmployeeEducation> getEducation(@PathVariable Long employeeId) {
        return educationRepository.findByEmployeeId(employeeId);
    }
    
    @PostMapping("/{employeeId}/education")
    public EmployeeEducation createEducation(@PathVariable Long employeeId, @RequestBody EmployeeEducation education) {
        return employeeRepository.findById(employeeId)
                .map(emp -> {
                    education.setEmployee(emp);
                    return educationRepository.save(education);
                })
                .orElseThrow(() -> new RuntimeException("Employee not found"));
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
    public List<EmployeeExperience> getExperience(@PathVariable Long employeeId) {
        return experienceRepository.findByEmployeeIdOrderByFromDateDesc(employeeId);
    }
    
    @PostMapping("/{employeeId}/experience")
    public EmployeeExperience createExperience(@PathVariable Long employeeId, @RequestBody EmployeeExperience experience) {
        return employeeRepository.findById(employeeId)
                .map(emp -> {
                    experience.setEmployee(emp);
                    return experienceRepository.save(experience);
                })
                .orElseThrow(() -> new RuntimeException("Employee not found"));
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
    public List<EmployeeAsset> getAssets(@PathVariable Long employeeId) {
        return assetRepository.findByEmployeeId(employeeId);
    }
    
    @PostMapping("/{employeeId}/assets")
    public EmployeeAsset createAsset(@PathVariable Long employeeId, @RequestBody EmployeeAsset asset, Authentication auth) {
        return employeeRepository.findById(employeeId)
                .map(emp -> {
                    asset.setEmployee(emp);
                    asset.setCreatedBy(auth != null ? auth.getName() : "system");
                    return assetRepository.save(asset);
                })
                .orElseThrow(() -> new RuntimeException("Employee not found"));
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
