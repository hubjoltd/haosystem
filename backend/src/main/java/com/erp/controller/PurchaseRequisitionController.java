package com.erp.controller;

import com.erp.model.PurchaseRequisition;
import com.erp.service.PurchaseRequisitionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/purchase/requisitions")
@CrossOrigin(origins = "*")
public class PurchaseRequisitionController {

    @Autowired
    private PurchaseRequisitionService prService;

    @GetMapping
    public ResponseEntity<List<PurchaseRequisition>> getAll() {
        return ResponseEntity.ok(prService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseRequisition> getById(@PathVariable Long id) {
        return prService.getById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<PurchaseRequisition>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(prService.getByStatus(status));
    }

    @PostMapping
    public ResponseEntity<PurchaseRequisition> create(@RequestBody PurchaseRequisition pr) {
        return ResponseEntity.ok(prService.create(pr));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PurchaseRequisition> update(@PathVariable Long id, @RequestBody PurchaseRequisition pr) {
        try {
            return ResponseEntity.ok(prService.update(id, pr));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            prService.delete(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<PurchaseRequisition> submit(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(prService.submit(id, "Admin", 1L));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<PurchaseRequisition> approve(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(prService.approve(id, "Admin", 1L));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<PurchaseRequisition> reject(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        try {
            String reason = body != null ? body.get("reason") : null;
            return ResponseEntity.ok(prService.reject(id, "Admin", 1L, reason));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
