package com.erp.service;

import com.erp.dto.*;
import com.erp.model.*;
import com.erp.model.Branch;
import com.erp.repository.*;
import com.erp.repository.BranchRepository;
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
    
    @Autowired
    private BranchRepository branchRepository;
    
    @Autowired
    private EmployeeRepository employeeRepository;
    
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
        
        Long branchId = user.getBranch() != null ? user.getBranch().getId() : null;
        String branchName = user.getBranch() != null ? user.getBranch().getName() : null;
        String branchCode = user.getBranch() != null ? user.getBranch().getCode() : null;
        Boolean isSuperAdmin = user.getIsSuperAdmin();
        
        if (request.getBranchId() != null) {
            if (isSuperAdmin) {
                Optional<Branch> selectedBranch = branchRepository.findById(request.getBranchId());
                if (selectedBranch.isPresent()) {
                    Branch branch = selectedBranch.get();
                    if (!branch.getActive()) {
                        throw new RuntimeException("Selected company is inactive");
                    }
                    branchId = branch.getId();
                    branchName = branch.getName();
                    branchCode = branch.getCode();
                } else {
                    throw new RuntimeException("Selected company not found");
                }
            } else if (user.getBranch() != null) {
                if (!user.getBranch().getId().equals(request.getBranchId())) {
                    throw new RuntimeException("You do not have access to the selected company");
                }
                if (!user.getBranch().getActive()) {
                    throw new RuntimeException("Your company is currently inactive");
                }
            } else {
                throw new RuntimeException("You are not assigned to any company");
            }
        } else if (!isSuperAdmin && user.getBranch() == null) {
            throw new RuntimeException("You are not assigned to any company. Please contact administrator.");
        }
        
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        
        Long employeeId = null;
        Optional<Employee> employeeOpt = employeeRepository.findByEmployeeCode(user.getUsername());
        if (employeeOpt.isPresent()) {
            employeeId = employeeOpt.get().getId();
        } else if (user.getEmail() != null) {
            employeeOpt = employeeRepository.findByEmail(user.getEmail());
            if (employeeOpt.isPresent()) {
                employeeId = employeeOpt.get().getId();
            }
        }
        
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().getName(), branchId, isSuperAdmin, employeeId, user.getId());
        
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
