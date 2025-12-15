package com.erp.controller;

import com.erp.model.PurchaseInvoice;
import com.erp.service.PurchaseInvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/purchase/invoices")
@CrossOrigin(origins = "*")
public class PurchaseInvoiceController {

    @Autowired
    private PurchaseInvoiceService invoiceService;

    @GetMapping
    public ResponseEntity<List<PurchaseInvoice>> getAll() {
        return ResponseEntity.ok(invoiceService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseInvoice> getById(@PathVariable Long id) {
        return invoiceService.getById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<PurchaseInvoice>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(invoiceService.getByStatus(status));
    }

    @GetMapping("/po/{poId}")
    public ResponseEntity<List<PurchaseInvoice>> getByPoId(@PathVariable Long poId) {
        return ResponseEntity.ok(invoiceService.getByPoId(poId));
    }

    @PostMapping
    public ResponseEntity<PurchaseInvoice> create(@RequestBody PurchaseInvoice invoice) {
        return ResponseEntity.ok(invoiceService.create(invoice));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PurchaseInvoice> update(@PathVariable Long id, @RequestBody PurchaseInvoice invoice) {
        try {
            return ResponseEntity.ok(invoiceService.update(id, invoice));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            invoiceService.delete(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/status")
    public ResponseEntity<PurchaseInvoice> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String status = body.get("status");
            return ResponseEntity.ok(invoiceService.updateStatus(id, status));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/generate-number")
    public ResponseEntity<String> generateInvoiceNumber() {
        return ResponseEntity.ok(invoiceService.generateInvoiceNumber());
    }
}
