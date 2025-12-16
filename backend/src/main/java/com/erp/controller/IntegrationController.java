package com.erp.controller;

import com.erp.model.IntegrationConfig;
import com.erp.model.IntegrationSyncLog;
import com.erp.service.IntegrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/integrations")
public class IntegrationController {

    @Autowired
    private IntegrationService integrationService;

    @GetMapping
    public ResponseEntity<List<IntegrationConfig>> getAllIntegrations() {
        return ResponseEntity.ok(integrationService.findAllRedacted());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getIntegrationById(@PathVariable Long id) {
        return integrationService.findById(id)
            .map(config -> ResponseEntity.ok(integrationService.redactSensitiveFields(config)))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<IntegrationConfig>> getIntegrationsByType(@PathVariable String type) {
        return ResponseEntity.ok(integrationService.findByType(type));
    }

    @GetMapping("/active")
    public ResponseEntity<List<IntegrationConfig>> getActiveIntegrations() {
        return ResponseEntity.ok(integrationService.findActive());
    }

    @GetMapping("/types")
    public ResponseEntity<List<Map<String, Object>>> getIntegrationTypes() {
        return ResponseEntity.ok(integrationService.getIntegrationTypes());
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getIntegrationStatus() {
        return ResponseEntity.ok(integrationService.getIntegrationStatus());
    }

    @PostMapping
    public ResponseEntity<?> createIntegration(@RequestBody Map<String, Object> data) {
        try {
            IntegrationConfig created = integrationService.create(data);
            return ResponseEntity.ok(integrationService.redactSensitiveFields(created));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateIntegration(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        try {
            IntegrationConfig updated = integrationService.update(id, data);
            return ResponseEntity.ok(integrationService.redactSensitiveFields(updated));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteIntegration(@PathVariable Long id) {
        try {
            integrationService.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/{id}/toggle-active")
    public ResponseEntity<?> toggleActive(@PathVariable Long id) {
        try {
            IntegrationConfig updated = integrationService.toggleActive(id);
            return ResponseEntity.ok(integrationService.redactSensitiveFields(updated));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/{id}/test")
    public ResponseEntity<Map<String, Object>> testConnection(@PathVariable Long id) {
        return ResponseEntity.ok(integrationService.testConnection(id));
    }

    @PostMapping("/{id}/sync")
    public ResponseEntity<?> triggerSync(
            @PathVariable Long id,
            @RequestParam(defaultValue = "FULL") String syncType,
            @RequestParam(required = false) String triggeredBy) {
        try {
            IntegrationSyncLog log = integrationService.triggerSync(id, syncType, triggeredBy);
            return ResponseEntity.ok(log);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/{id}/sync-logs")
    public ResponseEntity<List<IntegrationSyncLog>> getSyncLogs(@PathVariable Long id) {
        return ResponseEntity.ok(integrationService.getSyncLogs(id));
    }
}
