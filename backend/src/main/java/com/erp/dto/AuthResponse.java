package com.erp.dto;

public class AuthResponse {
    private String token;
    private Long userId;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private String permissions;
    private Long branchId;
    private String branchName;
    private String branchCode;
    private Boolean isSuperAdmin;
    
    public AuthResponse() {}
    
    public AuthResponse(String token, Long userId, String username, String email, String firstName, String lastName, String role, String permissions) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.permissions = permissions;
        this.isSuperAdmin = false;
    }
    
    public AuthResponse(String token, Long userId, String username, String email, String firstName, String lastName, 
                        String role, String permissions, Long branchId, String branchName, String branchCode, Boolean isSuperAdmin) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.permissions = permissions;
        this.branchId = branchId;
        this.branchName = branchName;
        this.branchCode = branchCode;
        this.isSuperAdmin = isSuperAdmin;
    }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getPermissions() { return permissions; }
    public void setPermissions(String permissions) { this.permissions = permissions; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public String getBranchName() { return branchName; }
    public void setBranchName(String branchName) { this.branchName = branchName; }
    public String getBranchCode() { return branchCode; }
    public void setBranchCode(String branchCode) { this.branchCode = branchCode; }
    public Boolean getIsSuperAdmin() { return isSuperAdmin; }
    public void setIsSuperAdmin(Boolean isSuperAdmin) { this.isSuperAdmin = isSuperAdmin; }
}
