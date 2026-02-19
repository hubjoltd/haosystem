package com.erp.controller;

import com.erp.model.*;
import com.erp.repository.EmployeeAssetRepository;
import com.erp.repository.EmployeeRepository;
import com.erp.service.OnboardingService;
import com.erp.service.UserNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/onboarding")
@CrossOrigin(origins = "*")
public class OnboardingController {

    @Autowired
    private OnboardingService onboardingService;

    @Autowired
    private EmployeeAssetRepository employeeAssetRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserNotificationService userNotificationService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(onboardingService.getOnboardingDashboard());
    }

    @GetMapping("/plans")
    public ResponseEntity<List<OnboardingPlan>> getAllPlans() {
        return ResponseEntity.ok(onboardingService.findAllPlans());
    }

    @GetMapping("/plans/{id}")
    public ResponseEntity<OnboardingPlan> getPlan(@PathVariable Long id) {
        return onboardingService.findPlanById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/plans/employee/{employeeId}")
    public ResponseEntity<OnboardingPlan> getPlanByEmployee(@PathVariable Long employeeId) {
        return onboardingService.findPlanByEmployee(employeeId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/plans/status/{status}")
    public ResponseEntity<List<OnboardingPlan>> getPlansByStatus(@PathVariable String status) {
        return ResponseEntity.ok(onboardingService.findPlansByStatus(status));
    }

    @GetMapping("/plans/overdue")
    public ResponseEntity<List<OnboardingPlan>> getOverduePlans() {
        return ResponseEntity.ok(onboardingService.findOverduePlans());
    }

    @GetMapping("/plans/incomplete")
    public ResponseEntity<List<OnboardingPlan>> getIncompletePlans() {
        return ResponseEntity.ok(onboardingService.findIncompletePlans());
    }

    @PostMapping("/plans")
    public ResponseEntity<OnboardingPlan> createPlan(@RequestBody Map<String, Object> data) {
        OnboardingPlan plan = onboardingService.createPlan(data);
        try {
            String empName = plan.getEmployee() != null ?
                plan.getEmployee().getFirstName() + " " + plan.getEmployee().getLastName() : "Unknown";
            userNotificationService.notifyAdminsAndHR(
                "Onboarding Plan Created",
                "Onboarding plan created for employee " + empName,
                "ONBOARDING", "ONBOARDING", plan.getId());
        } catch (Exception e) {}
        return ResponseEntity.ok(plan);
    }

    @PutMapping("/plans/{id}")
    public ResponseEntity<OnboardingPlan> updatePlan(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(onboardingService.updatePlan(id, data));
    }

    @PostMapping("/plans/{id}/start")
    public ResponseEntity<OnboardingPlan> startPlan(@PathVariable Long id) {
        return ResponseEntity.ok(onboardingService.startPlan(id));
    }

    @PostMapping("/plans/{id}/complete")
    public ResponseEntity<OnboardingPlan> completePlan(@PathVariable Long id) {
        OnboardingPlan plan = onboardingService.completePlan(id);
        try {
            String empName = plan.getEmployee() != null ?
                plan.getEmployee().getFirstName() + " " + plan.getEmployee().getLastName() : "Unknown";
            userNotificationService.notifyAdminsAndHR(
                "Onboarding Completed",
                "Onboarding completed for employee " + empName,
                "ONBOARDING", "ONBOARDING", plan.getId());
        } catch (Exception e) {}
        return ResponseEntity.ok(plan);
    }

    @DeleteMapping("/plans/{id}")
    public ResponseEntity<Void> deletePlan(@PathVariable Long id) {
        onboardingService.deletePlan(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/plans/{planId}/tasks")
    public ResponseEntity<List<OnboardingTask>> getTasksByPlan(@PathVariable Long planId) {
        return ResponseEntity.ok(onboardingService.findTasksByPlan(planId));
    }

    @GetMapping("/tasks/{id}")
    public ResponseEntity<OnboardingTask> getTask(@PathVariable Long id) {
        return onboardingService.findTaskById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/tasks/assignee/{employeeId}")
    public ResponseEntity<List<OnboardingTask>> getTasksByAssignee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(onboardingService.findTasksByAssignee(employeeId));
    }

    @GetMapping("/tasks/pending/{employeeId}")
    public ResponseEntity<List<OnboardingTask>> getPendingTasksForEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(onboardingService.findPendingTasksForEmployee(employeeId));
    }

    @GetMapping("/tasks/overdue")
    public ResponseEntity<List<OnboardingTask>> getOverdueTasks() {
        return ResponseEntity.ok(onboardingService.findOverdueTasks());
    }

    @PostMapping("/tasks")
    public ResponseEntity<OnboardingTask> createTask(@RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(onboardingService.createTask(data));
    }

    @PutMapping("/tasks/{id}")
    public ResponseEntity<OnboardingTask> updateTask(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(onboardingService.updateTask(id, data));
    }

    @PostMapping("/tasks/{id}/start")
    public ResponseEntity<OnboardingTask> startTask(@PathVariable Long id) {
        return ResponseEntity.ok(onboardingService.startTask(id));
    }

    @PostMapping("/tasks/{id}/complete")
    public ResponseEntity<OnboardingTask> completeTask(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> data) {
        Long completedById = null;
        if (data != null && data.get("completedById") != null) {
            completedById = Long.valueOf(data.get("completedById").toString());
        }
        return ResponseEntity.ok(onboardingService.completeTask(id, completedById));
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        onboardingService.deleteTask(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/assets/employee/{employeeId}")
    public ResponseEntity<List<EmployeeAsset>> getAssetsByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(employeeAssetRepository.findByEmployeeId(employeeId));
    }

    @GetMapping("/assets/pending-returns")
    public ResponseEntity<List<EmployeeAsset>> getPendingReturns() {
        return ResponseEntity.ok(employeeAssetRepository.findByStatus("Issued"));
    }

    @PostMapping("/assets")
    public ResponseEntity<?> assignAsset(@RequestBody Map<String, Object> data) {
        try {
            Long employeeId = null;
            if (data.get("employeeId") != null) {
                employeeId = Long.valueOf(data.get("employeeId").toString());
            } else if (data.get("employee") != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> empMap = (Map<String, Object>) data.get("employee");
                if (empMap.get("id") != null) {
                    employeeId = Long.valueOf(empMap.get("id").toString());
                }
            }

            if (employeeId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Employee ID is required"));
            }

            Employee employee = employeeRepository.findById(employeeId).orElse(null);
            if (employee == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Employee not found"));
            }

            EmployeeAsset asset = new EmployeeAsset();
            asset.setEmployee(employee);
            asset.setAssetType((String) data.get("assetType"));
            asset.setAssetName((String) data.get("assetName"));
            asset.setSerialNumber((String) data.get("serialNumber"));
            asset.setAssetCode((String) data.get("assetTag"));
            asset.setDescription((String) data.get("notes"));
            asset.setStatus("Issued");

            if (data.get("assignedDate") != null) {
                asset.setIssueDate(LocalDate.parse((String) data.get("assignedDate")));
            } else {
                asset.setIssueDate(LocalDate.now());
            }

            EmployeeAsset saved = employeeAssetRepository.save(asset);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to assign asset: " + e.getMessage()));
        }
    }

    @PostMapping("/assets/{id}/return")
    public ResponseEntity<?> returnAsset(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> data) {
        return employeeAssetRepository.findById(id)
            .map(asset -> {
                asset.setStatus("Returned");
                asset.setReturnDate(LocalDate.now());
                if (data != null && data.get("returnNotes") != null) {
                    asset.setRemarks((String) data.get("returnNotes"));
                }
                EmployeeAsset saved = employeeAssetRepository.save(asset);
                return ResponseEntity.ok((Object) saved);
            })
            .orElse(ResponseEntity.notFound().build());
    }
}
