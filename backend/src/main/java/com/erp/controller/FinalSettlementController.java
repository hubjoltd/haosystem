package com.erp.controller;

import com.erp.model.FinalSettlement;
import com.erp.service.FinalSettlementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/settlements")
@CrossOrigin(origins = "*")
public class FinalSettlementController {
    
    @Autowired
    private FinalSettlementService settlementService;
    
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(settlementService.getDashboard());
    }
    
    @GetMapping
    public ResponseEntity<List<FinalSettlement>> getAll() {
        return ResponseEntity.ok(settlementService.findAll());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<FinalSettlement> getById(@PathVariable Long id) {
        return settlementService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<FinalSettlement>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(settlementService.findByStatus(status));
    }
    
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<FinalSettlement> getByEmployeeId(@PathVariable Long employeeId) {
        return settlementService.findByEmployeeId(employeeId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<?> initiateSettlement(@RequestBody Map<String, Object> request) {
        try {
            Long employeeId = Long.parseLong(request.get("employeeId").toString());
            LocalDate lastWorkingDay = LocalDate.parse(request.get("lastWorkingDay").toString());
            String separationType = request.get("separationType").toString();
            String createdBy = request.getOrDefault("createdBy", "System").toString();
            
            FinalSettlement settlement = settlementService.initiateSettlement(
                employeeId, lastWorkingDay, separationType, createdBy);
            return ResponseEntity.ok(settlement);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody FinalSettlement settlement) {
        try {
            return ResponseEntity.ok(settlementService.update(id, settlement));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/{id}/submit")
    public ResponseEntity<?> submit(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(settlementService.submit(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String approvedBy = request.getOrDefault("approvedBy", "Admin");
            return ResponseEntity.ok(settlementService.approve(id, approvedBy));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String remarks = request.getOrDefault("remarks", "");
            return ResponseEntity.ok(settlementService.reject(id, remarks));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/{id}/process")
    public ResponseEntity<?> process(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String processedBy = request.getOrDefault("processedBy", "Admin");
            return ResponseEntity.ok(settlementService.process(id, processedBy));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            settlementService.delete(id);
            return ResponseEntity.ok(Map.of("message", "Settlement deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
