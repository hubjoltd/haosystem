package com.erp.service;

import com.erp.model.User;
import com.erp.model.Role;
import com.erp.repository.UserRepository;
import com.erp.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

@Service
public class StaffService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public List<User> findAll() {
        return userRepository.findAll();
    }
    
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
    
    public User save(User user) {
        if (user.getId() == null) {
            user.setCreatedAt(LocalDateTime.now());
            if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(user.getPassword()));
            }
        }
        return userRepository.save(user);
    }
    
    public User create(Map<String, Object> staffData) {
        User user = new User();
        user.setFirstName((String) staffData.get("firstName"));
        user.setLastName((String) staffData.get("lastName"));
        user.setEmail((String) staffData.get("email"));
        user.setPhone((String) staffData.get("phone"));
        user.setActive(staffData.get("active") != null ? (Boolean) staffData.get("active") : true);
        user.setCreatedAt(LocalDateTime.now());
        
        String username = user.getEmail().split("@")[0];
        int suffix = 1;
        String baseUsername = username;
        while (userRepository.existsByUsername(username)) {
            username = baseUsername + suffix++;
        }
        user.setUsername(username);
        
        String tempPassword = "Welcome@123";
        user.setPassword(passwordEncoder.encode(tempPassword));
        
        if (staffData.get("roleId") != null) {
            Long roleId = Long.valueOf(staffData.get("roleId").toString());
            roleRepository.findById(roleId).ifPresent(user::setRole);
        } else if (staffData.get("role") != null) {
            String roleName = (String) staffData.get("role");
            roleRepository.findByName(roleName).ifPresent(user::setRole);
        }
        
        return userRepository.save(user);
    }
    
    public User update(Long id, Map<String, Object> staffData) {
        Optional<User> existingOpt = userRepository.findById(id);
        if (existingOpt.isEmpty()) {
            throw new RuntimeException("Staff member not found");
        }
        
        User user = existingOpt.get();
        
        if (staffData.get("firstName") != null) {
            user.setFirstName((String) staffData.get("firstName"));
        }
        if (staffData.get("lastName") != null) {
            user.setLastName((String) staffData.get("lastName"));
        }
        if (staffData.get("email") != null) {
            user.setEmail((String) staffData.get("email"));
        }
        if (staffData.get("phone") != null) {
            user.setPhone((String) staffData.get("phone"));
        }
        if (staffData.get("active") != null) {
            user.setActive((Boolean) staffData.get("active"));
        }
        
        if (staffData.get("roleId") != null) {
            Long roleId = Long.valueOf(staffData.get("roleId").toString());
            roleRepository.findById(roleId).ifPresent(user::setRole);
        } else if (staffData.get("role") != null) {
            String roleName = (String) staffData.get("role");
            roleRepository.findByName(roleName).ifPresent(user::setRole);
        }
        
        return userRepository.save(user);
    }
    
    public void deleteById(Long id) {
        userRepository.deleteById(id);
    }
    
    public void toggleActive(Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setActive(!user.getActive());
            userRepository.save(user);
        }
    }
    
    public List<Map<String, Object>> findAllWithDetails() {
        List<User> users = userRepository.findAll();
        return users.stream().map(user -> {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("username", user.getUsername());
            userMap.put("firstName", user.getFirstName());
            userMap.put("lastName", user.getLastName());
            userMap.put("email", user.getEmail());
            userMap.put("phone", user.getPhone());
            userMap.put("active", user.getActive());
            userMap.put("role", user.getRole() != null ? user.getRole().getName() : "");
            userMap.put("roleId", user.getRole() != null ? user.getRole().getId() : null);
            userMap.put("lastLogin", formatLastLogin(user.getLastLogin()));
            userMap.put("createdAt", user.getCreatedAt());
            return userMap;
        }).toList();
    }
    
    private String formatLastLogin(LocalDateTime lastLogin) {
        if (lastLogin == null) {
            return "Never";
        }
        
        Duration duration = Duration.between(lastLogin, LocalDateTime.now());
        long hours = duration.toHours();
        long days = duration.toDays();
        
        if (hours < 1) {
            return "Just now";
        } else if (hours < 24) {
            return hours + " hrs ago";
        } else if (days < 7) {
            return days + " days ago";
        } else {
            return lastLogin.toLocalDate().toString();
        }
    }
}
