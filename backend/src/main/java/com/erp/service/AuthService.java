package com.erp.service;

import com.erp.dto.*;
import com.erp.model.*;
import com.erp.repository.*;
import com.erp.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    public AuthResponse login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Invalid username or password");
        }
        
        User user = userOpt.get();
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }
        
        if (!user.getActive()) {
            throw new RuntimeException("Account is disabled");
        }
        
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        
        Long branchId = user.getBranch() != null ? user.getBranch().getId() : null;
        String branchName = user.getBranch() != null ? user.getBranch().getName() : null;
        String branchCode = user.getBranch() != null ? user.getBranch().getCode() : null;
        Boolean isSuperAdmin = user.getIsSuperAdmin();
        
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().getName(), branchId, isSuperAdmin);
        
        return new AuthResponse(
            token,
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getRole().getName(),
            user.getRole().getPermissions(),
            branchId,
            branchName,
            branchCode,
            isSuperAdmin
        );
    }
    
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        Role role;
        if (request.getRoleId() != null) {
            role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new RuntimeException("Role not found"));
        } else {
            role = roleRepository.findByName("STAFF")
                .orElseGet(() -> {
                    Role staffRole = new Role("STAFF", "Standard staff member", "read,create,update");
                    return roleRepository.save(staffRole);
                });
        }
        
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setRole(role);
        user.setActive(true);
        user.setIsSuperAdmin(false);
        user.setCreatedAt(LocalDateTime.now());
        
        userRepository.save(user);
        
        String token = jwtUtil.generateToken(user.getUsername(), role.getName(), null, false);
        
        return new AuthResponse(
            token,
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            role.getName(),
            role.getPermissions(),
            null,
            null,
            null,
            false
        );
    }
    
    public void initializeDefaultRoles() {
        if (roleRepository.count() == 0) {
            roleRepository.save(new Role("SUPER_ADMIN", "Super Administrator with all branches access", "all"));
            roleRepository.save(new Role("ADMIN", "Branch Administrator", "all"));
            roleRepository.save(new Role("MANAGER", "Manager with full access", "read,create,update,delete,reports"));
            roleRepository.save(new Role("STAFF", "Standard staff member", "read,create,update"));
            roleRepository.save(new Role("VIEWER", "Read-only access", "read"));
        }
    }
    
    public void createDefaultAdmin() {
        if (!userRepository.existsByUsername("admin")) {
            initializeDefaultRoles();
            
            Role superAdminRole = roleRepository.findByName("SUPER_ADMIN")
                .orElseGet(() -> roleRepository.save(new Role("SUPER_ADMIN", "Super Administrator with all branches access", "all")));
            
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@erp.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFirstName("System");
            admin.setLastName("Administrator");
            admin.setRole(superAdminRole);
            admin.setActive(true);
            admin.setIsSuperAdmin(true);
            admin.setCreatedAt(LocalDateTime.now());
            
            userRepository.save(admin);
        }
    }
}
