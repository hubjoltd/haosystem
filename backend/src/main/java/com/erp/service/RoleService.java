package com.erp.service;

import com.erp.model.Branch;
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
    
    public List<Role> findByBranchId(Long branchId) {
        return roleRepository.findByBranch_Id(branchId);
    }
    
    public List<Role> findByBranchIdOrSystemRole(Long branchId) {
        return roleRepository.findByBranchIdOrSystemRole(branchId);
    }
    
    public Optional<Role> findById(Long id) {
        return roleRepository.findById(id);
    }
    
    public Optional<Role> findByName(String name) {
        return roleRepository.findByName(name);
    }
    
    public Optional<Role> findByNameAndBranchId(String name, Long branchId) {
        return roleRepository.findByNameAndBranch_Id(name, branchId);
    }
    
    public Role save(Role role) {
        return roleRepository.save(role);
    }
    
    public void deleteById(Long id) {
        roleRepository.deleteById(id);
    }
    
    public boolean existsByNameAndBranchId(String name, Long branchId) {
        return roleRepository.existsByNameAndBranchId(name, branchId);
    }
    
    public long countUsersByRole(Long roleId) {
        List<User> users = userRepository.findAll();
        return users.stream()
            .filter(u -> u.getRole() != null && u.getRole().getId().equals(roleId))
            .count();
    }
    
    public long countUsersByRoleAndBranch(Long roleId, Long branchId) {
        List<User> users = userRepository.findByBranchId(branchId);
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
            roleMap.put("branchId", role.getBranchId());
            roleMap.put("isSystemRole", role.getIsSystemRole());
            roleMap.put("totalUsers", countUsersByRole(role.getId()));
            return roleMap;
        }).toList();
    }
    
    public List<Map<String, Object>> findByBranchWithUserCount(Long branchId) {
        List<Role> roles = roleRepository.findByBranch_Id(branchId);
        return roles.stream().map(role -> {
            Map<String, Object> roleMap = new HashMap<>();
            roleMap.put("id", role.getId());
            roleMap.put("name", role.getName());
            roleMap.put("description", role.getDescription());
            roleMap.put("permissions", role.getPermissions());
            roleMap.put("branchId", role.getBranchId());
            roleMap.put("isSystemRole", role.getIsSystemRole());
            roleMap.put("totalUsers", countUsersByRoleAndBranch(role.getId(), branchId));
            return roleMap;
        }).toList();
    }
    
    public void createDefaultRolesForBranch(Branch branch) {
        String fullPermissions = "{\"Dashboard\":{\"view\":true,\"add\":true,\"edit\":true,\"delete\":true},\"Settings\":{\"view\":true,\"add\":true,\"edit\":true,\"delete\":true},\"Customer Management\":{\"view\":true,\"add\":true,\"edit\":true,\"delete\":true},\"Purchase\":{\"view\":true,\"add\":true,\"edit\":true,\"delete\":true},\"Inventory\":{\"view\":true,\"add\":true,\"edit\":true,\"delete\":true},\"HR Management\":{\"view\":true,\"add\":true,\"edit\":true,\"delete\":true},\"Payroll\":{\"view\":true,\"add\":true,\"edit\":true,\"delete\":true},\"Attendance\":{\"view\":true,\"add\":true,\"edit\":true,\"delete\":true},\"Accounting\":{\"view\":true,\"add\":true,\"edit\":true,\"delete\":true},\"Projects\":{\"view\":true,\"add\":true,\"edit\":true,\"delete\":true},\"Expenses\":{\"view\":true,\"add\":true,\"edit\":true,\"delete\":true},\"Leave\":{\"view\":true,\"add\":true,\"edit\":true,\"delete\":true},\"Reports\":{\"view\":true,\"add\":true,\"edit\":true,\"delete\":true}}";
        String managerPermissions = "{\"Dashboard\":{\"view\":true,\"add\":false,\"edit\":false,\"delete\":false},\"Customer Management\":{\"view\":true,\"add\":true,\"edit\":true,\"delete\":false},\"Purchase\":{\"view\":true,\"add\":true,\"edit\":true,\"delete\":false},\"Inventory\":{\"view\":true,\"add\":true,\"edit\":true,\"delete\":false},\"HR Management\":{\"view\":true,\"add\":true,\"edit\":true,\"delete\":false},\"Payroll\":{\"view\":true,\"add\":false,\"edit\":false,\"delete\":false},\"Attendance\":{\"view\":true,\"add\":true,\"edit\":true,\"delete\":false},\"Accounting\":{\"view\":true,\"add\":true,\"edit\":true,\"delete\":false},\"Projects\":{\"view\":true,\"add\":true,\"edit\":true,\"delete\":false},\"Expenses\":{\"view\":true,\"add\":true,\"edit\":true,\"delete\":false},\"Leave\":{\"view\":true,\"add\":true,\"edit\":true,\"delete\":false},\"Reports\":{\"view\":true,\"add\":false,\"edit\":false,\"delete\":false}}";
        String staffPermissions = "{\"Dashboard\":{\"view\":true,\"add\":false,\"edit\":false,\"delete\":false},\"Customer Management\":{\"view\":true,\"add\":true,\"edit\":false,\"delete\":false},\"Attendance\":{\"view\":true,\"add\":true,\"edit\":false,\"delete\":false},\"Projects\":{\"view\":true,\"add\":true,\"edit\":true,\"delete\":false},\"Expenses\":{\"view\":true,\"add\":true,\"edit\":false,\"delete\":false},\"Leave\":{\"view\":true,\"add\":true,\"edit\":false,\"delete\":false}}";
        String viewerPermissions = "{\"Dashboard\":{\"view\":true,\"add\":false,\"edit\":false,\"delete\":false},\"Reports\":{\"view\":true,\"add\":false,\"edit\":false,\"delete\":false}}";
        
        if (!roleRepository.existsByNameAndBranchId("ADMIN", branch.getId())) {
            roleRepository.save(new Role("ADMIN", "Company Administrator with full access", fullPermissions, branch));
        }
        if (!roleRepository.existsByNameAndBranchId("MANAGER", branch.getId())) {
            roleRepository.save(new Role("MANAGER", "Manager with limited administrative access", managerPermissions, branch));
        }
        if (!roleRepository.existsByNameAndBranchId("STAFF", branch.getId())) {
            roleRepository.save(new Role("STAFF", "Standard staff member", staffPermissions, branch));
        }
        if (!roleRepository.existsByNameAndBranchId("VIEWER", branch.getId())) {
            roleRepository.save(new Role("VIEWER", "Read-only access to reports", viewerPermissions, branch));
        }
    }
}
