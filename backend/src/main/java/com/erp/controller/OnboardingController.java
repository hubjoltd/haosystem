package com.erp.controller;

import com.erp.model.*;
import com.erp.service.OnboardingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/onboarding")
@CrossOrigin(origins = "*")
public class OnboardingController {

    @Autowired
    private OnboardingService onboardingService;

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
        return ResponseEntity.ok(onboardingService.createPlan(data));
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
        return ResponseEntity.ok(onboardingService.completePlan(id));
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
    public ResponseEntity<OnboardingTask> completeTask(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        Long completedById = data.get("completedById") != null ? Long.valueOf(data.get("completedById").toString()) : null;
        return ResponseEntity.ok(onboardingService.completeTask(id, completedById));
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        onboardingService.deleteTask(id);
        return ResponseEntity.ok().build();
    }
}
