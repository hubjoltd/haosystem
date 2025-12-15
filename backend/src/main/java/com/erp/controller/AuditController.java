package com.erp.controller;

import com.erp.model.AuditLog;
import com.erp.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/audit")
@CrossOrigin(origins = "*")
public class AuditController {

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAuditLogs(
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String modules,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String performedBy,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String search) {
        
        List<AuditLog> logs = auditLogService.getRecentLogs();
        
        // Apply filters
        if (module != null && !module.isEmpty()) {
            logs = filterByModule(logs, module);
        }
        
        if (modules != null && !modules.isEmpty()) {
            String[] moduleList = modules.split(",");
            logs = filterByModules(logs, Arrays.asList(moduleList));
        }
        
        if (entityType != null && !entityType.isEmpty()) {
            logs = logs.stream()
                .filter(log -> entityType.equalsIgnoreCase(log.getEntityType()))
                .collect(Collectors.toList());
        }
        
        if (action != null && !action.isEmpty()) {
            logs = logs.stream()
                .filter(log -> mapActionToFrontend(log.getAction()).equalsIgnoreCase(action))
                .collect(Collectors.toList());
        }
        
        if (performedBy != null && !performedBy.isEmpty()) {
            logs = logs.stream()
                .filter(log -> log.getUsername() != null && 
                    log.getUsername().toLowerCase().contains(performedBy.toLowerCase()))
                .collect(Collectors.toList());
        }
        
        if (startDate != null && !startDate.isEmpty()) {
            LocalDateTime start = parseDate(startDate).atStartOfDay();
            logs = logs.stream()
                .filter(log -> log.getTimestamp() != null && !log.getTimestamp().isBefore(start))
                .collect(Collectors.toList());
        }
        
        if (endDate != null && !endDate.isEmpty()) {
            LocalDateTime end = parseDate(endDate).atTime(23, 59, 59);
            logs = logs.stream()
                .filter(log -> log.getTimestamp() != null && !log.getTimestamp().isAfter(end))
                .collect(Collectors.toList());
        }
        
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            logs = logs.stream()
                .filter(log -> 
                    (log.getEntityName() != null && log.getEntityName().toLowerCase().contains(searchLower)) ||
                    (log.getUsername() != null && log.getUsername().toLowerCase().contains(searchLower)) ||
                    (log.getEntityType() != null && log.getEntityType().toLowerCase().contains(searchLower)))
                .collect(Collectors.toList());
        }
        
        // Convert to frontend format
        List<Map<String, Object>> result = logs.stream()
            .map(this::convertToFrontendFormat)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<List<Map<String, Object>>> getAuditLogsByEntity(
            @PathVariable String entityType,
            @PathVariable Long entityId) {
        
        List<AuditLog> logs = auditLogService.getLogsByEntityAndId(entityType, entityId);
        
        List<Map<String, Object>> result = logs.stream()
            .map(this::convertToFrontendFormat)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }

    private Map<String, Object> convertToFrontendFormat(AuditLog log) {
        Map<String, Object> result = new HashMap<>();
        result.put("id", log.getId());
        result.put("entityType", log.getEntityType());
        result.put("entityId", log.getEntityId());
        result.put("entityName", log.getEntityName());
        result.put("action", mapActionToFrontend(log.getAction()));
        result.put("performedBy", log.getUsername());
        result.put("performedById", 0);
        result.put("timestamp", log.getTimestamp() != null ? log.getTimestamp().toString() : null);
        result.put("previousValue", log.getOldValue());
        result.put("newValue", log.getNewValue());
        result.put("ipAddress", log.getIpAddress());
        result.put("module", deriveModule(log.getEntityType(), log.getAction()));
        return result;
    }

    private String mapActionToFrontend(String action) {
        if (action == null) return "UNKNOWN";
        switch (action.toUpperCase()) {
            case "CREATE": return "CREATED";
            case "UPDATE": return "UPDATED";
            case "DELETE": return "DELETED";
            case "LOGIN": return "LOGIN";
            case "LOGOUT": return "LOGOUT";
            case "SUBMIT": return "SUBMITTED";
            case "APPROVE": return "APPROVED";
            case "REJECT": return "REJECTED";
            default: return action.toUpperCase();
        }
    }

    private String deriveModule(String entityType, String action) {
        if (entityType == null) return "SYSTEM";
        
        String type = entityType.toUpperCase();
        
        // System module - login/logout and user operations
        if ("USER".equals(type) || "LOGIN".equalsIgnoreCase(action) || "LOGOUT".equalsIgnoreCase(action)) {
            return "SYSTEM";
        }
        
        // Settings module - check first to avoid false positives with PREFIX containing "PR"
        if (type.contains("SETTING") || type.contains("CONFIG") || type.contains("PREFIX") ||
            type.contains("TAX") || type.contains("CURRENCY") || type.contains("PAYMENT") ||
            type.contains("EXPENSE") || type.contains("ROLE") || type.contains("STAFF") ||
            type.contains("GENERAL") || type.contains("FINANCE")) {
            return "SETTINGS";
        }
        
        // Purchase module - use explicit matches to avoid false positives
        if (type.equals("PR") || type.equals("PURCHASE_REQUISITION") || 
            type.equals("PURCHASE_ORDER") || type.equals("PO") ||
            type.equals("PURCHASE_INVOICE") || type.equals("DIRECT_PURCHASE") ||
            type.startsWith("PURCHASE_") || type.contains("_PURCHASE") ||
            (type.contains("PURCHASE") && !type.contains("PREFIX"))) {
            return "PURCHASE";
        }
        
        // Stock movement module
        if (type.contains("GRN") || type.contains("GOODS_RECEIPT") ||
            type.contains("GOODS_ISSUE") || type.contains("STOCK_TRANSFER") || 
            type.contains("STOCK_ADJUSTMENT") || type.equals("STOCK_MOVEMENT") ||
            (type.contains("ISSUE") && !type.contains("INVOICE")) ||
            (type.contains("TRANSFER") && type.contains("STOCK"))) {
            return "STOCK_MOVEMENT";
        }
        
        // Inventory module
        if (type.contains("ITEM") || type.contains("GROUP") || type.contains("WAREHOUSE") || 
            type.contains("BIN") || type.contains("SUPPLIER") || type.contains("UNIT") ||
            type.contains("INVENTORY") || type.contains("UOM")) {
            return "INVENTORY";
        }
        
        // Customer module
        if (type.contains("CUSTOMER")) {
            return "CUSTOMER";
        }
        
        // Contract module
        if (type.contains("CONTRACT")) {
            return "CONTRACT";
        }
        
        return "SYSTEM";
    }

    private List<AuditLog> filterByModule(List<AuditLog> logs, String module) {
        return logs.stream()
            .filter(log -> module.equalsIgnoreCase(deriveModule(log.getEntityType(), log.getAction())))
            .collect(Collectors.toList());
    }

    private List<AuditLog> filterByModules(List<AuditLog> logs, List<String> modules) {
        return logs.stream()
            .filter(log -> {
                String logModule = deriveModule(log.getEntityType(), log.getAction());
                return modules.stream().anyMatch(m -> m.trim().equalsIgnoreCase(logModule));
            })
            .collect(Collectors.toList());
    }

    private LocalDate parseDate(String dateStr) {
        try {
            return LocalDate.parse(dateStr);
        } catch (Exception e) {
            try {
                return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            } catch (Exception e2) {
                return LocalDate.now();
            }
        }
    }
}
