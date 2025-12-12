package com.erp.controller;

import com.erp.model.User;
import com.erp.service.StaffService;
import com.erp.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/staff")
public class StaffController {
    
    @Autowired
    private StaffService staffService;
    
    @Autowired
    private RoleService roleService;
    
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllStaff() {
        return ResponseEntity.ok(staffService.findAllWithDetails());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getStaffById(@PathVariable Long id) {
        return staffService.findById(id)
            .map(user -> {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("firstName", user.getFirstName());
                userMap.put("lastName", user.getLastName());
                userMap.put("email", user.getEmail());
                userMap.put("phone", user.getPhone());
                userMap.put("active", user.getActive());
                userMap.put("role", user.getRole() != null ? user.getRole().getName() : "");
                userMap.put("roleId", user.getRole() != null ? user.getRole().getId() : null);
                return ResponseEntity.ok(userMap);
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<?> createStaff(@RequestBody Map<String, Object> staffData) {
        try {
            User saved = staffService.create(staffData);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateStaff(@PathVariable Long id, @RequestBody Map<String, Object> staffData) {
        try {
            User updated = staffService.update(id, staffData);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStaff(@PathVariable Long id) {
        if (staffService.findById(id).isPresent()) {
            staffService.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping("/{id}/toggle-active")
    public ResponseEntity<?> toggleActive(@PathVariable Long id) {
        staffService.toggleActive(id);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/roles")
    public ResponseEntity<List<Map<String, Object>>> getRolesForDropdown() {
        return ResponseEntity.ok(roleService.findAllWithUserCount());
    }
}
