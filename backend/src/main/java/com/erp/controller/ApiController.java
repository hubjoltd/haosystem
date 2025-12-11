package com.erp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
public class ApiController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "ERP API is running");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", 0);
        stats.put("totalRevenue", 0);
        stats.put("totalCustomers", 0);
        stats.put("totalProducts", 0);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/customers")
    public ResponseEntity<List<Object>> getCustomers() {
        return ResponseEntity.ok(new ArrayList<>());
    }

    @GetMapping("/contracts")
    public ResponseEntity<List<Object>> getContracts() {
        return ResponseEntity.ok(new ArrayList<>());
    }

    @GetMapping("/inventory/groups")
    public ResponseEntity<List<Object>> getGroups() {
        return ResponseEntity.ok(new ArrayList<>());
    }

    @GetMapping("/inventory/items")
    public ResponseEntity<List<Object>> getItems() {
        return ResponseEntity.ok(new ArrayList<>());
    }

    @GetMapping("/inventory/units")
    public ResponseEntity<List<Object>> getUnits() {
        return ResponseEntity.ok(new ArrayList<>());
    }

    @GetMapping("/inventory/warehouses")
    public ResponseEntity<List<Object>> getWarehouses() {
        return ResponseEntity.ok(new ArrayList<>());
    }

    @GetMapping("/inventory/suppliers")
    public ResponseEntity<List<Object>> getSuppliers() {
        return ResponseEntity.ok(new ArrayList<>());
    }

    @GetMapping("/stock/grn")
    public ResponseEntity<List<Object>> getGRNs() {
        return ResponseEntity.ok(new ArrayList<>());
    }

    @GetMapping("/stock/issues")
    public ResponseEntity<List<Object>> getIssues() {
        return ResponseEntity.ok(new ArrayList<>());
    }

    @GetMapping("/stock/transfers")
    public ResponseEntity<List<Object>> getTransfers() {
        return ResponseEntity.ok(new ArrayList<>());
    }

    @GetMapping("/stock/adjustments")
    public ResponseEntity<List<Object>> getAdjustments() {
        return ResponseEntity.ok(new ArrayList<>());
    }

    @GetMapping("/settings/general")
    public ResponseEntity<Map<String, Object>> getGeneralSettings() {
        return ResponseEntity.ok(new HashMap<>());
    }

    @GetMapping("/settings/finance")
    public ResponseEntity<Map<String, Object>> getFinanceSettings() {
        return ResponseEntity.ok(new HashMap<>());
    }

    @GetMapping("/settings/roles")
    public ResponseEntity<List<Object>> getRoles() {
        return ResponseEntity.ok(new ArrayList<>());
    }

    @GetMapping("/settings/staff")
    public ResponseEntity<List<Object>> getStaff() {
        return ResponseEntity.ok(new ArrayList<>());
    }
}
