package com.erp.controller;

import com.erp.model.*;
import com.erp.service.CompensationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/compensation")
@CrossOrigin(origins = "*")
public class CompensationController {

    @Autowired
    private CompensationService compensationService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(compensationService.getCompensationDashboard());
    }

    @GetMapping("/salary-bands")
    public ResponseEntity<List<SalaryBand>> getAllSalaryBands() {
        return ResponseEntity.ok(compensationService.findAllSalaryBands());
    }

    @GetMapping("/salary-bands/active")
    public ResponseEntity<List<SalaryBand>> getActiveSalaryBands() {
        return ResponseEntity.ok(compensationService.findActiveSalaryBands());
    }

    @GetMapping("/salary-bands/{id}")
    public ResponseEntity<SalaryBand> getSalaryBand(@PathVariable Long id) {
        return compensationService.findSalaryBandById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/salary-bands/grade/{gradeId}")
    public ResponseEntity<List<SalaryBand>> getSalaryBandsByGrade(@PathVariable Long gradeId) {
        return ResponseEntity.ok(compensationService.findSalaryBandsByGrade(gradeId));
    }

    @PostMapping("/salary-bands")
    public ResponseEntity<SalaryBand> createSalaryBand(@RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(compensationService.createSalaryBand(data));
    }

    @PutMapping("/salary-bands/{id}")
    public ResponseEntity<SalaryBand> updateSalaryBand(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(compensationService.updateSalaryBand(id, data));
    }

    @DeleteMapping("/salary-bands/{id}")
    public ResponseEntity<Void> deleteSalaryBand(@PathVariable Long id) {
        compensationService.deleteSalaryBand(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/benefit-plans")
    public ResponseEntity<List<BenefitPlan>> getAllBenefitPlans() {
        return ResponseEntity.ok(compensationService.findAllBenefitPlans());
    }

    @GetMapping("/benefit-plans/active")
    public ResponseEntity<List<BenefitPlan>> getActiveBenefitPlans() {
        return ResponseEntity.ok(compensationService.findActiveBenefitPlans());
    }

    @GetMapping("/benefit-plans/{id}")
    public ResponseEntity<BenefitPlan> getBenefitPlan(@PathVariable Long id) {
        return compensationService.findBenefitPlanById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/benefit-plans/type/{type}")
    public ResponseEntity<List<BenefitPlan>> getBenefitPlansByType(@PathVariable String type) {
        return ResponseEntity.ok(compensationService.findBenefitPlansByType(type));
    }

    @PostMapping("/benefit-plans")
    public ResponseEntity<BenefitPlan> createBenefitPlan(@RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(compensationService.createBenefitPlan(data));
    }

    @PutMapping("/benefit-plans/{id}")
    public ResponseEntity<BenefitPlan> updateBenefitPlan(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(compensationService.updateBenefitPlan(id, data));
    }

    @DeleteMapping("/benefit-plans/{id}")
    public ResponseEntity<Void> deleteBenefitPlan(@PathVariable Long id) {
        compensationService.deleteBenefitPlan(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/employee/{employeeId}/salary/current")
    public ResponseEntity<EmployeeSalary> getCurrentSalary(@PathVariable Long employeeId) {
        return compensationService.findCurrentSalary(employeeId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/employee/{employeeId}/salary/history")
    public ResponseEntity<List<EmployeeSalary>> getSalaryHistory(@PathVariable Long employeeId) {
        return ResponseEntity.ok(compensationService.findSalaryHistoryByEmployee(employeeId));
    }

    @PostMapping("/employee/salary/revision")
    public ResponseEntity<EmployeeSalary> createSalaryRevision(@RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(compensationService.createSalaryRevision(data));
    }

    @PutMapping("/employee/salary/{id}")
    public ResponseEntity<EmployeeSalary> updateEmployeeSalary(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(compensationService.updateEmployeeSalary(id, data));
    }

    @GetMapping("/employee/{employeeId}/benefits")
    public ResponseEntity<List<EmployeeBenefit>> getEmployeeBenefits(@PathVariable Long employeeId) {
        return ResponseEntity.ok(compensationService.findBenefitsByEmployee(employeeId));
    }

    @GetMapping("/employee/{employeeId}/benefits/active")
    public ResponseEntity<List<EmployeeBenefit>> getActiveEmployeeBenefits(@PathVariable Long employeeId) {
        return ResponseEntity.ok(compensationService.findActiveBenefitsByEmployee(employeeId));
    }

    @PostMapping("/employee/benefits/enroll")
    public ResponseEntity<EmployeeBenefit> enrollEmployeeInBenefit(@RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(compensationService.enrollEmployeeInBenefit(data));
    }

    @PutMapping("/employee/benefits/{id}")
    public ResponseEntity<EmployeeBenefit> updateEmployeeBenefit(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(compensationService.updateEmployeeBenefit(id, data));
    }

    @PostMapping("/employee/benefits/{id}/terminate")
    public ResponseEntity<EmployeeBenefit> terminateBenefit(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        LocalDate terminationDate = LocalDate.parse((String) data.get("terminationDate"));
        return ResponseEntity.ok(compensationService.terminateBenefit(id, terminationDate));
    }

    @DeleteMapping("/employee/benefits/{id}")
    public ResponseEntity<Void> deleteEmployeeBenefit(@PathVariable Long id) {
        compensationService.deleteEmployeeBenefit(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/employee/{employeeId}/summary")
    public ResponseEntity<Map<String, Object>> getEmployeeCompensationSummary(@PathVariable Long employeeId) {
        return ResponseEntity.ok(compensationService.getEmployeeCompensationSummary(employeeId));
    }
}
