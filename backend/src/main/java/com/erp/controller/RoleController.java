package com.erp.controller;

import com.erp.model.Role;
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
    
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllRoles() {
        return ResponseEntity.ok(roleService.findAllWithUserCount());
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
                roleMap.put("totalUsers", roleService.countUsersByRole(role.getId()));
                return ResponseEntity.ok(roleMap);
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<?> createRole(@RequestBody Role role) {
        try {
            Role saved = roleService.save(role);
            return ResponseEntity.ok(saved);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "A role with this name already exists");
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateRole(@PathVariable Long id, @RequestBody Role role) {
        return roleService.findById(id)
            .map(existing -> {
                try {
                    role.setId(id);
                    Role updated = roleService.save(role);
                    return ResponseEntity.ok((Object)updated);
                } catch (org.springframework.dao.DataIntegrityViolationException e) {
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "A role with this name already exists");
                    return ResponseEntity.badRequest().body((Object)error);
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
