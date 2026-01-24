package com.erp.controller;

import com.erp.model.*;
import com.erp.repository.*;
import com.erp.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

@RestController
@RequestMapping("/api/organization")
@CrossOrigin(origins = "*")
public class OrganizationController {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private JobRoleRepository jobRoleRepository;

    @Autowired
    private GradeRepository gradeRepository;

    @Autowired
    private DesignationRepository designationRepository;

    @Autowired
    private CostCenterRepository costCenterRepository;

    @Autowired
    private ExpenseCenterRepository expenseCenterRepository;
    
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

    @GetMapping("/departments")
    public ResponseEntity<List<Department>> getAllDepartments(HttpServletRequest request) {
        if (isSuperAdmin(request)) {
            return ResponseEntity.ok(departmentRepository.findAll());
        }
        Long branchId = extractBranchId(request);
        if (branchId != null) {
            return ResponseEntity.ok(departmentRepository.findByBranchId(branchId));
        }
        return ResponseEntity.ok(departmentRepository.findAll());
    }

    @GetMapping("/departments/{id}")
    public ResponseEntity<Department> getDepartmentById(@PathVariable Long id, HttpServletRequest request) {
        if (isSuperAdmin(request)) {
            return departmentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        }
        Long branchId = extractBranchId(request);
        if (branchId != null) {
            return departmentRepository.findByIdAndBranchId(id, branchId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        }
        return departmentRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/departments")
    public ResponseEntity<Department> createDepartment(@RequestBody Department department, HttpServletRequest request) {
        Long branchId = extractBranchId(request);
        if (branchId != null && department.getBranch() == null) {
            branchRepository.findById(branchId).ifPresent(department::setBranch);
        }
        return ResponseEntity.ok(departmentRepository.save(department));
    }

    @PutMapping("/departments/{id}")
    public ResponseEntity<Department> updateDepartment(@PathVariable Long id, @RequestBody Department department, HttpServletRequest request) {
        Long branchId = extractBranchId(request);
        return departmentRepository.findById(id)
            .filter(existing -> isSuperAdmin(request) || branchId == null || 
                   (existing.getBranch() != null && existing.getBranch().getId().equals(branchId)))
            .map(existing -> {
                existing.setCode(department.getCode());
                existing.setName(department.getName());
                existing.setDescription(department.getDescription());
                existing.setParent(department.getParent());
                existing.setCostCenter(department.getCostCenter());
                existing.setLocation(department.getLocation());
                existing.setActive(department.getActive());
                return ResponseEntity.ok(departmentRepository.save(existing));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/departments/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id, HttpServletRequest request) {
        Long branchId = extractBranchId(request);
        return departmentRepository.findById(id)
            .filter(existing -> isSuperAdmin(request) || branchId == null || 
                   (existing.getBranch() != null && existing.getBranch().getId().equals(branchId)))
            .map(dept -> {
                departmentRepository.delete(dept);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/locations")
    public ResponseEntity<List<Location>> getAllLocations() {
        return ResponseEntity.ok(locationRepository.findAll());
    }

    @GetMapping("/locations/{id}")
    public ResponseEntity<Location> getLocationById(@PathVariable Long id) {
        return locationRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/locations")
    public ResponseEntity<Location> createLocation(@RequestBody Location location) {
        return ResponseEntity.ok(locationRepository.save(location));
    }

    @PutMapping("/locations/{id}")
    public ResponseEntity<Location> updateLocation(@PathVariable Long id, @RequestBody Location location) {
        return locationRepository.findById(id)
            .map(existing -> {
                existing.setCode(location.getCode());
                existing.setName(location.getName());
                existing.setAddress(location.getAddress());
                existing.setCity(location.getCity());
                existing.setState(location.getState());
                existing.setCountry(location.getCountry());
                existing.setZipCode(location.getZipCode());
                existing.setPhone(location.getPhone());
                existing.setEmail(location.getEmail());
                existing.setLocationType(location.getLocationType());
                existing.setActive(location.getActive());
                return ResponseEntity.ok(locationRepository.save(existing));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/locations/{id}")
    public ResponseEntity<Void> deleteLocation(@PathVariable Long id) {
        if (locationRepository.existsById(id)) {
            locationRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/job-roles")
    public ResponseEntity<List<JobRole>> getAllJobRoles() {
        return ResponseEntity.ok(jobRoleRepository.findAll());
    }

    @GetMapping("/job-roles/{id}")
    public ResponseEntity<JobRole> getJobRoleById(@PathVariable Long id) {
        return jobRoleRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/job-roles")
    public ResponseEntity<JobRole> createJobRole(@RequestBody JobRole jobRole) {
        return ResponseEntity.ok(jobRoleRepository.save(jobRole));
    }

    @PutMapping("/job-roles/{id}")
    public ResponseEntity<JobRole> updateJobRole(@PathVariable Long id, @RequestBody JobRole jobRole) {
        return jobRoleRepository.findById(id)
            .map(existing -> {
                existing.setCode(jobRole.getCode());
                existing.setTitle(jobRole.getTitle());
                existing.setDescription(jobRole.getDescription());
                existing.setDepartment(jobRole.getDepartment());
                existing.setGrade(jobRole.getGrade());
                existing.setActive(jobRole.getActive());
                return ResponseEntity.ok(jobRoleRepository.save(existing));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/job-roles/{id}")
    public ResponseEntity<Void> deleteJobRole(@PathVariable Long id) {
        if (jobRoleRepository.existsById(id)) {
            jobRoleRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/grades")
    public ResponseEntity<List<Grade>> getAllGrades() {
        return ResponseEntity.ok(gradeRepository.findAll());
    }

    @GetMapping("/grades/{id}")
    public ResponseEntity<Grade> getGradeById(@PathVariable Long id) {
        return gradeRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/grades")
    public ResponseEntity<Grade> createGrade(@RequestBody Grade grade) {
        return ResponseEntity.ok(gradeRepository.save(grade));
    }

    @PutMapping("/grades/{id}")
    public ResponseEntity<Grade> updateGrade(@PathVariable Long id, @RequestBody Grade grade) {
        return gradeRepository.findById(id)
            .map(existing -> {
                existing.setCode(grade.getCode());
                existing.setName(grade.getName());
                existing.setDescription(grade.getDescription());
                existing.setLevel(grade.getLevel());
                existing.setMinSalary(grade.getMinSalary());
                existing.setMaxSalary(grade.getMaxSalary());
                existing.setActive(grade.getActive());
                return ResponseEntity.ok(gradeRepository.save(existing));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/grades/{id}")
    public ResponseEntity<Void> deleteGrade(@PathVariable Long id) {
        if (gradeRepository.existsById(id)) {
            gradeRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/designations")
    public ResponseEntity<List<Designation>> getAllDesignations() {
        return ResponseEntity.ok(designationRepository.findAll());
    }

    @GetMapping("/designations/{id}")
    public ResponseEntity<Designation> getDesignationById(@PathVariable Long id) {
        return designationRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/designations")
    public ResponseEntity<Designation> createDesignation(@RequestBody Designation designation) {
        return ResponseEntity.ok(designationRepository.save(designation));
    }

    @PutMapping("/designations/{id}")
    public ResponseEntity<Designation> updateDesignation(@PathVariable Long id, @RequestBody Designation designation) {
        return designationRepository.findById(id)
            .map(existing -> {
                existing.setCode(designation.getCode());
                existing.setTitle(designation.getTitle());
                existing.setDescription(designation.getDescription());
                existing.setGrade(designation.getGrade());
                existing.setActive(designation.getActive());
                return ResponseEntity.ok(designationRepository.save(existing));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/designations/{id}")
    public ResponseEntity<Void> deleteDesignation(@PathVariable Long id) {
        if (designationRepository.existsById(id)) {
            designationRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/cost-centers")
    public ResponseEntity<List<CostCenter>> getAllCostCenters() {
        return ResponseEntity.ok(costCenterRepository.findAll());
    }

    @GetMapping("/cost-centers/{id}")
    public ResponseEntity<CostCenter> getCostCenterById(@PathVariable Long id) {
        return costCenterRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/cost-centers")
    public ResponseEntity<CostCenter> createCostCenter(@RequestBody CostCenter costCenter) {
        return ResponseEntity.ok(costCenterRepository.save(costCenter));
    }

    @PutMapping("/cost-centers/{id}")
    public ResponseEntity<CostCenter> updateCostCenter(@PathVariable Long id, @RequestBody CostCenter costCenter) {
        return costCenterRepository.findById(id)
            .map(existing -> {
                existing.setCode(costCenter.getCode());
                existing.setName(costCenter.getName());
                existing.setDescription(costCenter.getDescription());
                existing.setParent(costCenter.getParent());
                existing.setActive(costCenter.getActive());
                return ResponseEntity.ok(costCenterRepository.save(existing));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/cost-centers/{id}")
    public ResponseEntity<Void> deleteCostCenter(@PathVariable Long id) {
        if (costCenterRepository.existsById(id)) {
            costCenterRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/expense-centers")
    public ResponseEntity<List<ExpenseCenter>> getAllExpenseCenters() {
        return ResponseEntity.ok(expenseCenterRepository.findAll());
    }

    @GetMapping("/expense-centers/{id}")
    public ResponseEntity<ExpenseCenter> getExpenseCenterById(@PathVariable Long id) {
        return expenseCenterRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/expense-centers")
    public ResponseEntity<ExpenseCenter> createExpenseCenter(@RequestBody ExpenseCenter expenseCenter) {
        return ResponseEntity.ok(expenseCenterRepository.save(expenseCenter));
    }

    @PutMapping("/expense-centers/{id}")
    public ResponseEntity<ExpenseCenter> updateExpenseCenter(@PathVariable Long id, @RequestBody ExpenseCenter expenseCenter) {
        return expenseCenterRepository.findById(id)
            .map(existing -> {
                existing.setCode(expenseCenter.getCode());
                existing.setName(expenseCenter.getName());
                existing.setDescription(expenseCenter.getDescription());
                existing.setCostCenter(expenseCenter.getCostCenter());
                existing.setActive(expenseCenter.getActive());
                return ResponseEntity.ok(expenseCenterRepository.save(existing));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/expense-centers/{id}")
    public ResponseEntity<Void> deleteExpenseCenter(@PathVariable Long id) {
        if (expenseCenterRepository.existsById(id)) {
            expenseCenterRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
