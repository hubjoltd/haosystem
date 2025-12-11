package com.erp.service;

import com.erp.model.AuditLog;
import com.erp.repository.AuditLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditLogService {
    
    @Autowired
    private AuditLogRepository auditLogRepository;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    public void logCreate(String entityType, Long entityId, String entityName, Object newValue) {
        AuditLog log = new AuditLog(getCurrentUser(), "CREATE", entityType, entityId, entityName);
        log.setNewValue(toJson(newValue));
        auditLogRepository.save(log);
    }
    
    public void logUpdate(String entityType, Long entityId, String entityName, Object oldValue, Object newValue) {
        AuditLog log = new AuditLog(getCurrentUser(), "UPDATE", entityType, entityId, entityName);
        log.setOldValue(toJson(oldValue));
        log.setNewValue(toJson(newValue));
        auditLogRepository.save(log);
    }
    
    public void logDelete(String entityType, Long entityId, String entityName, Object oldValue) {
        AuditLog log = new AuditLog(getCurrentUser(), "DELETE", entityType, entityId, entityName);
        log.setOldValue(toJson(oldValue));
        auditLogRepository.save(log);
    }
    
    public void logLogin(String username) {
        AuditLog log = new AuditLog(username, "LOGIN", "USER", null, username);
        auditLogRepository.save(log);
    }
    
    public void logLogout(String username) {
        AuditLog log = new AuditLog(username, "LOGOUT", "USER", null, username);
        auditLogRepository.save(log);
    }
    
    public List<AuditLog> getRecentLogs() {
        return auditLogRepository.findTop100ByOrderByTimestampDesc();
    }
    
    public List<AuditLog> getLogsByUser(String username) {
        return auditLogRepository.findByUsername(username);
    }
    
    public List<AuditLog> getLogsByEntity(String entityType) {
        return auditLogRepository.findByEntityType(entityType);
    }
    
    public List<AuditLog> getLogsByEntityAndId(String entityType, Long entityId) {
        return auditLogRepository.findByEntityTypeAndEntityId(entityType, entityId);
    }
    
    public List<AuditLog> getLogsByDateRange(LocalDateTime start, LocalDateTime end) {
        return auditLogRepository.findByTimestampBetween(start, end);
    }
    
    private String getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return auth.getName();
        }
        return "SYSTEM";
    }
    
    private String toJson(Object obj) {
        if (obj == null) return null;
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return obj.toString();
        }
    }
}
