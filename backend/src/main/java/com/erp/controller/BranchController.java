package com.erp.controller;

import com.erp.dto.RegisterRequest;
import com.erp.model.Branch;
import com.erp.model.Role;
import com.erp.model.User;
import com.erp.repository.BranchRepository;
import com.erp.repository.RoleRepository;
import com.erp.repository.UserRepository;
import com.erp.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/branches")
public class BranchController {
    
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
    
    private String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
    
    private boolean isSuperAdmin(HttpServletRequest request) {
        String token = extractToken(request);
        if (token == null) return false;
        try {
            return jwtUtil.extractIsSuperAdmin(token);
        } catch (Exception e) {
            return false;
        }
    }
    
    private ResponseEntity<?> forbiddenResponse() {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Access denied. Super admin privileges required.");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }
    
    @GetMapping
    public ResponseEntity<?> getAllBranches(HttpServletRequest request) {
        if (!isSuperAdmin(request)) {
            return forbiddenResponse();
        }
        return ResponseEntity.ok(branchRepository.findAll());
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<Branch>> getActiveBranches() {
        return ResponseEntity.ok(branchRepository.findByActiveTrue());
    }
    
    @GetMapping("/by-slug/{slug}")
    public ResponseEntity<?> getBranchBySlug(@PathVariable String slug) {
        return branchRepository.findBySlug(slug)
            .filter(Branch::getActive)
            .map(branch -> ResponseEntity.ok((Object) branch))
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/my-branch")
    public ResponseEntity<?> getMyBranch(HttpServletRequest request) {
        String token = extractToken(request);
        if (token == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Authentication required");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
        try {
            Long branchId = jwtUtil.extractBranchId(token);
            if (branchId == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "No branch assigned to user");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            return branchRepository.findById(branchId)
                .map(branch -> ResponseEntity.ok((Object) branch))
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to retrieve branch");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getBranchById(@PathVariable Long id, HttpServletRequest request) {
        if (!isSuperAdmin(request)) {
            return forbiddenResponse();
        }
        return branchRepository.findById(id)
            .map(branch -> ResponseEntity.ok((Object) branch))
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<?> createBranch(@RequestBody Branch branch, HttpServletRequest request) {
        if (!isSuperAdmin(request)) {
            return forbiddenResponse();
        }
        if (branchRepository.existsByCode(branch.getCode())) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Branch code already exists");
            return ResponseEntity.badRequest().body(error);
        }
        if (branch.getSlug() == null || branch.getSlug().isEmpty()) {
            branch.setSlug(branch.getCode().toLowerCase().replaceAll("[^a-z0-9]", "-"));
        }
        if (branchRepository.existsBySlug(branch.getSlug())) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "URL slug already exists");
            return ResponseEntity.badRequest().body(error);
        }
        branch.setCreatedAt(LocalDateTime.now());
        branch.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(branchRepository.save(branch));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBranch(@PathVariable Long id, @RequestBody Branch branch, HttpServletRequest request) {
        if (!isSuperAdmin(request)) {
            return forbiddenResponse();
        }
        return branchRepository.findById(id)
            .map(existing -> {
                existing.setName(branch.getName());
                existing.setAddress(branch.getAddress());
                existing.setCity(branch.getCity());
                existing.setState(branch.getState());
                existing.setCountry(branch.getCountry());
                existing.setZipCode(branch.getZipCode());
                existing.setPhone(branch.getPhone());
                existing.setEmail(branch.getEmail());
                existing.setWebsite(branch.getWebsite());
                existing.setLogoPath(branch.getLogoPath());
                existing.setCurrency(branch.getCurrency());
                existing.setDateFormat(branch.getDateFormat());
                existing.setTimezone(branch.getTimezone());
                existing.setActive(branch.getActive());
                existing.setPrimaryColor(branch.getPrimaryColor());
                existing.setSecondaryColor(branch.getSecondaryColor());
                if (branch.getSlug() != null && !branch.getSlug().isEmpty() && !branch.getSlug().equals(existing.getSlug())) {
                    if (branchRepository.existsBySlug(branch.getSlug())) {
                        return ResponseEntity.badRequest().body((Object) java.util.Map.of("error", "URL slug already exists"));
                    }
                    existing.setSlug(branch.getSlug());
                }
                existing.setUpdatedAt(LocalDateTime.now());
                return ResponseEntity.ok((Object) branchRepository.save(existing));
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBranch(@PathVariable Long id, HttpServletRequest request) {
        if (!isSuperAdmin(request)) {
            return forbiddenResponse();
        }
        if (branchRepository.existsById(id)) {
            List<User> branchUsers = userRepository.findByBranchId(id);
            if (!branchUsers.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Cannot delete branch with existing users. Remove users first.");
                return ResponseEntity.badRequest().body(error);
            }
            branchRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/{branchId}/users")
    public ResponseEntity<?> getBranchUsers(@PathVariable Long branchId, HttpServletRequest request) {
        if (!isSuperAdmin(request)) {
            return forbiddenResponse();
        }
        if (!branchRepository.existsById(branchId)) {
            return ResponseEntity.notFound().build();
        }
        List<User> users = userRepository.findByBranchId(branchId);
        users.forEach(u -> u.setPassword(null));
        return ResponseEntity.ok(users);
    }
    
    @PostMapping("/{branchId}/users")
    public ResponseEntity<?> createBranchUser(@PathVariable Long branchId, @RequestBody RegisterRequest registerRequest, HttpServletRequest request) {
        if (!isSuperAdmin(request)) {
            return forbiddenResponse();
        }
        
        Branch branch = branchRepository.findById(branchId)
            .orElse(null);
        
        if (branch == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Branch not found");
            return ResponseEntity.badRequest().body(error);
        }
        
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Username already exists");
            return ResponseEntity.badRequest().body(error);
        }
        
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Email already exists");
            return ResponseEntity.badRequest().body(error);
        }
        
        Role role;
        if (registerRequest.getRoleId() != null) {
            role = roleRepository.findById(registerRequest.getRoleId())
                .orElseThrow(() -> new RuntimeException("Role not found"));
        } else {
            role = roleRepository.findByName("STAFF")
                .orElseGet(() -> roleRepository.save(new Role("STAFF", "Standard staff member", "read,create,update")));
        }
        
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setPhone(registerRequest.getPhone());
        user.setRole(role);
        user.setBranch(branch);
        user.setIsSuperAdmin(false);
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        savedUser.setPassword(null);
        
        return ResponseEntity.ok(savedUser);
    }
    
    @PutMapping("/{branchId}/users/{userId}")
    public ResponseEntity<?> updateBranchUser(@PathVariable Long branchId, @PathVariable Long userId, @RequestBody User userUpdate, HttpServletRequest request) {
        if (!isSuperAdmin(request)) {
            return forbiddenResponse();
        }
        
        Branch branch = branchRepository.findById(branchId).orElse(null);
        if (branch == null) {
            return ResponseEntity.notFound().build();
        }
        
        return userRepository.findById(userId)
            .filter(user -> user.getBranch() != null && user.getBranch().getId().equals(branchId))
            .map(existing -> {
                existing.setFirstName(userUpdate.getFirstName());
                existing.setLastName(userUpdate.getLastName());
                existing.setEmail(userUpdate.getEmail());
                existing.setPhone(userUpdate.getPhone());
                existing.setActive(userUpdate.getActive());
                
                if (userUpdate.getRole() != null && userUpdate.getRole().getId() != null) {
                    roleRepository.findById(userUpdate.getRole().getId())
                        .ifPresent(existing::setRole);
                }
                
                User saved = userRepository.save(existing);
                saved.setPassword(null);
                return ResponseEntity.ok((Object) saved);
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{branchId}/users/{userId}")
    public ResponseEntity<?> deleteBranchUser(@PathVariable Long branchId, @PathVariable Long userId, HttpServletRequest request) {
        if (!isSuperAdmin(request)) {
            return forbiddenResponse();
        }
        return userRepository.findById(userId)
            .filter(user -> user.getBranch() != null && user.getBranch().getId().equals(branchId))
            .map(user -> {
                userRepository.deleteById(userId);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{branchId}/users/{userId}/password")
    public ResponseEntity<?> resetBranchUserPassword(@PathVariable Long branchId, @PathVariable Long userId, @RequestBody Map<String, String> passwordRequest, HttpServletRequest request) {
        if (!isSuperAdmin(request)) {
            return forbiddenResponse();
        }
        
        String newPassword = passwordRequest.get("password");
        if (newPassword == null || newPassword.length() < 6) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Password must be at least 6 characters");
            return ResponseEntity.badRequest().body(error);
        }
        
        return userRepository.findById(userId)
            .filter(user -> user.getBranch() != null && user.getBranch().getId().equals(branchId))
            .map(user -> {
                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
                Map<String, String> response = new HashMap<>();
                response.put("message", "Password updated successfully");
                return ResponseEntity.ok((Object) response);
            })
            .orElse(ResponseEntity.notFound().build());
    }
}
