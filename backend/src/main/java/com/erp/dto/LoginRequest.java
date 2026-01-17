package com.erp.dto;

public class LoginRequest {
    private String username;
    private String password;
    private Long branchId;
    
    public LoginRequest() {}
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
}
