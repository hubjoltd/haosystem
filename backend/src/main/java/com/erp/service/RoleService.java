package com.erp.service;

import com.erp.model.Role;
import com.erp.model.User;
import com.erp.repository.RoleRepository;
import com.erp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

@Service
public class RoleService {
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public List<Role> findAll() {
        return roleRepository.findAll();
    }
    
    public Optional<Role> findById(Long id) {
        return roleRepository.findById(id);
    }
    
    public Optional<Role> findByName(String name) {
        return roleRepository.findByName(name);
    }
    
    public Role save(Role role) {
        return roleRepository.save(role);
    }
    
    public void deleteById(Long id) {
        roleRepository.deleteById(id);
    }
    
    public long countUsersByRole(Long roleId) {
        List<User> users = userRepository.findAll();
        return users.stream()
            .filter(u -> u.getRole() != null && u.getRole().getId().equals(roleId))
            .count();
    }
    
    public List<Map<String, Object>> findAllWithUserCount() {
        List<Role> roles = roleRepository.findAll();
        return roles.stream().map(role -> {
            Map<String, Object> roleMap = new HashMap<>();
            roleMap.put("id", role.getId());
            roleMap.put("name", role.getName());
            roleMap.put("description", role.getDescription());
            roleMap.put("permissions", role.getPermissions());
            roleMap.put("totalUsers", countUsersByRole(role.getId()));
            return roleMap;
        }).toList();
    }
}
