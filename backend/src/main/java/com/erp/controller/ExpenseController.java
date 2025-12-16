package com.erp.controller;

import com.erp.model.ExpenseCategory;
import com.erp.model.ExpenseRequest;
import com.erp.model.ExpenseItem;
import com.erp.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @GetMapping("/categories")
    public ResponseEntity<List<ExpenseCategory>> getAllCategories() {
        return ResponseEntity.ok(expenseService.findAllCategories());
    }

    @GetMapping("/categories/active")
    public ResponseEntity<List<ExpenseCategory>> getActiveCategories() {
        return ResponseEntity.ok(expenseService.findActiveCategories());
    }

    @GetMapping("/categories/{id}")
    public ResponseEntity<?> getCategoryById(@PathVariable Long id) {
        return expenseService.findCategoryById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(@RequestBody Map<String, Object> data) {
        try {
            ExpenseCategory created = expenseService.createCategory(data);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        try {
            ExpenseCategory updated = expenseService.updateCategory(id, data);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        try {
            expenseService.deleteCategoryById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/categories/init")
    public ResponseEntity<?> initializeDefaultCategories() {
        try {
            expenseService.initializeDefaultCategories();
            Map<String, String> response = new HashMap<>();
            response.put("message", "Default expense categories initialized");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping
    public ResponseEntity<List<ExpenseRequest>> getAllRequests() {
        return ResponseEntity.ok(expenseService.findAllRequests());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRequestById(@PathVariable Long id) {
        return expenseService.findRequestById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<ExpenseRequest>> getRequestsByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(expenseService.findRequestsByEmployee(employeeId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ExpenseRequest>> getRequestsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(expenseService.findRequestsByStatus(status));
    }

    @GetMapping("/pending-approvals/{approverId}")
    public ResponseEntity<List<ExpenseRequest>> getPendingApprovals(@PathVariable Long approverId) {
        return ResponseEntity.ok(expenseService.findPendingApprovals(approverId));
    }

    @GetMapping("/pending-reimbursements")
    public ResponseEntity<List<ExpenseRequest>> getPendingReimbursements() {
        return ResponseEntity.ok(expenseService.findPendingReimbursements());
    }

    @GetMapping("/approved-not-posted")
    public ResponseEntity<List<ExpenseRequest>> getApprovedNotPosted() {
        return ResponseEntity.ok(expenseService.findApprovedNotPosted());
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        return ResponseEntity.ok(expenseService.getExpenseStatistics());
    }

    @GetMapping("/by-category")
    public ResponseEntity<Map<String, Object>> getExpensesByCategory(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        LocalDate start = startDate != null ? LocalDate.parse(startDate) : LocalDate.now().minusMonths(1);
        LocalDate end = endDate != null ? LocalDate.parse(endDate) : LocalDate.now();
        return ResponseEntity.ok(expenseService.getExpensesByCategory(start, end));
    }

    @PostMapping
    public ResponseEntity<?> createRequest(@RequestBody Map<String, Object> data) {
        try {
            ExpenseRequest created = expenseService.createRequest(data);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRequest(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        try {
            ExpenseRequest updated = expenseService.updateRequest(id, data);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRequest(@PathVariable Long id) {
        try {
            expenseService.deleteRequest(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/{id}/items")
    public ResponseEntity<?> addItem(@PathVariable Long id, @RequestBody Map<String, Object> itemData) {
        try {
            ExpenseItem item = expenseService.addItemToRequest(id, itemData);
            return ResponseEntity.ok(item);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{requestId}/items/{itemId}")
    public ResponseEntity<?> removeItem(@PathVariable Long requestId, @PathVariable Long itemId) {
        try {
            expenseService.removeItemFromRequest(requestId, itemId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<?> submitRequest(
            @PathVariable Long id,
            @RequestParam(required = false) String submittedBy) {
        try {
            ExpenseRequest submitted = expenseService.submitRequest(id, submittedBy);
            return ResponseEntity.ok(submitted);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long id, @RequestBody Map<String, Object> approvalData) {
        try {
            ExpenseRequest approved = expenseService.approveRequest(id, approvalData);
            return ResponseEntity.ok(approved);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        try {
            String reason = (String) data.get("reason");
            ExpenseRequest rejected = expenseService.rejectRequest(id, reason);
            return ResponseEntity.ok(rejected);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<?> returnRequest(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        try {
            String reason = (String) data.get("reason");
            ExpenseRequest returned = expenseService.returnRequest(id, reason);
            return ResponseEntity.ok(returned);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/{id}/reimburse")
    public ResponseEntity<?> markReimbursed(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        try {
            Long payrollRecordId = data.get("payrollRecordId") != null 
                ? Long.valueOf(data.get("payrollRecordId").toString()) : null;
            ExpenseRequest reimbursed = expenseService.markReimbursed(id, payrollRecordId);
            return ResponseEntity.ok(reimbursed);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/{id}/post-to-accounts")
    public ResponseEntity<?> postToAccounts(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        try {
            String accountingReference = (String) data.get("accountingReference");
            ExpenseRequest posted = expenseService.postToAccounts(id, accountingReference);
            return ResponseEntity.ok(posted);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
