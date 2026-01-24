package com.erp.controller;

import com.erp.model.Branch;
import com.erp.model.Role;
import com.erp.repository.BranchRepository;
import com.erp.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/roles")
public class RoleController {
    
    @Autowired
    private RoleService roleService;
    
    @Autowired
    private BranchRepository branchRepository;
    
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllRoles() {
        return ResponseEntity.ok(roleService.findAllWithUserCount());
    }
    
    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<Map<String, Object>>> getRolesByBranch(@PathVariable Long branchId) {
        return ResponseEntity.ok(roleService.findByBranchWithUserCount(branchId));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getRoleById(@PathVariable Long id) {
        return roleService.findById(id)
            .map(role -> {
                Map<String, Object> roleMap = new HashMap<>();
                roleMap.put("id", role.getId());
                roleMap.put("name", role.getName());
                roleMap.put("description", role.getDescription());
                roleMap.put("permissions", role.getPermissions());
                roleMap.put("branchId", role.getBranchId());
                roleMap.put("isSystemRole", role.getIsSystemRole());
                roleMap.put("totalUsers", roleService.countUsersByRole(role.getId()));
                return ResponseEntity.ok(roleMap);
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<?> createRole(@RequestBody Map<String, Object> roleData) {
        try {
            Role role = new Role();
            role.setName((String) roleData.get("name"));
            role.setDescription((String) roleData.get("description"));
            role.setPermissions((String) roleData.get("permissions"));
            
            Object branchIdObj = roleData.get("branchId");
            if (branchIdObj != null) {
                Long branchId = branchIdObj instanceof Integer ? ((Integer) branchIdObj).longValue() : (Long) branchIdObj;
                Branch branch = branchRepository.findById(branchId).orElse(null);
                if (branch != null) {
                    if (roleService.existsByNameAndBranchId(role.getName(), branchId)) {
                        Map<String, String> error = new HashMap<>();
                        error.put("error", "A role with this name already exists in this company");
                        return ResponseEntity.badRequest().body(error);
                    }
                    role.setBranch(branch);
                }
            }
            
            Role saved = roleService.save(role);
            Map<String, Object> response = new HashMap<>();
            response.put("id", saved.getId());
            response.put("name", saved.getName());
            response.put("description", saved.getDescription());
            response.put("permissions", saved.getPermissions());
            response.put("branchId", saved.getBranchId());
            return ResponseEntity.ok(response);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "A role with this name already exists");
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateRole(@PathVariable Long id, @RequestBody Map<String, Object> roleData) {
        return roleService.findById(id)
            .map(existing -> {
                try {
                    existing.setName((String) roleData.get("name"));
                    existing.setDescription((String) roleData.get("description"));
                    existing.setPermissions((String) roleData.get("permissions"));
                    
                    Role updated = roleService.save(existing);
                    Map<String, Object> response = new HashMap<>();
                    response.put("id", updated.getId());
                    response.put("name", updated.getName());
                    response.put("description", updated.getDescription());
                    response.put("permissions", updated.getPermissions());
                    response.put("branchId", updated.getBranchId());
                    return ResponseEntity.ok((Object) response);
                } catch (org.springframework.dao.DataIntegrityViolationException e) {
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "A role with this name already exists");
                    return ResponseEntity.badRequest().body((Object) error);
                }
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRole(@PathVariable Long id) {
        if (roleService.findById(id).isPresent()) {
            long userCount = roleService.countUsersByRole(id);
            if (userCount > 0) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Cannot delete role with " + userCount + " assigned users");
                return ResponseEntity.badRequest().body(error);
            }
            roleService.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
