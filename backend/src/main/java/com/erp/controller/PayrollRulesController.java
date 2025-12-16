package com.erp.controller;

import com.erp.model.*;
import com.erp.repository.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payroll/rules")
@CrossOrigin(origins = "*")
public class PayrollRulesController {

    @Autowired
    private SalaryHeadRepository salaryHeadRepository;

    @Autowired
    private PayFrequencyRepository payFrequencyRepository;

    @Autowired
    private OvertimeRuleRepository overtimeRuleRepository;

    @Autowired
    private TaxRuleRepository taxRuleRepository;

    @Autowired
    private StatutoryRuleRepository statutoryRuleRepository;

    @GetMapping("/salary-heads")
    public ResponseEntity<List<SalaryHead>> getAllSalaryHeads() {
        return ResponseEntity.ok(salaryHeadRepository.findByIsActiveTrueOrderByDisplayOrderAsc());
    }

    @GetMapping("/salary-heads/all")
    public ResponseEntity<List<SalaryHead>> getAllSalaryHeadsIncludingInactive() {
        return ResponseEntity.ok(salaryHeadRepository.findAllByOrderByDisplayOrderAsc());
    }

    @GetMapping("/salary-heads/{id}")
    public ResponseEntity<SalaryHead> getSalaryHeadById(@PathVariable Long id) {
        return salaryHeadRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/salary-heads/type/{type}")
    public ResponseEntity<List<SalaryHead>> getSalaryHeadsByType(@PathVariable String type) {
        return ResponseEntity.ok(salaryHeadRepository.findByHeadTypeAndIsActiveTrue(type));
    }

    @PostMapping("/salary-heads")
    public ResponseEntity<SalaryHead> createSalaryHead(@RequestBody SalaryHead salaryHead) {
        return ResponseEntity.ok(salaryHeadRepository.save(salaryHead));
    }

    @PutMapping("/salary-heads/{id}")
    public ResponseEntity<SalaryHead> updateSalaryHead(@PathVariable Long id, @RequestBody SalaryHead salaryHead) {
        return salaryHeadRepository.findById(id)
            .map(existing -> {
                salaryHead.setId(id);
                salaryHead.setCreatedAt(existing.getCreatedAt());
                return ResponseEntity.ok(salaryHeadRepository.save(salaryHead));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/salary-heads/{id}")
    public ResponseEntity<Void> deleteSalaryHead(@PathVariable Long id) {
        if (salaryHeadRepository.existsById(id)) {
            salaryHeadRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/pay-frequencies")
    public ResponseEntity<List<PayFrequency>> getAllPayFrequencies() {
        return ResponseEntity.ok(payFrequencyRepository.findByIsActiveTrue());
    }

    @GetMapping("/pay-frequencies/all")
    public ResponseEntity<List<PayFrequency>> getAllPayFrequenciesIncludingInactive() {
        return ResponseEntity.ok(payFrequencyRepository.findAll());
    }

    @GetMapping("/pay-frequencies/{id}")
    public ResponseEntity<PayFrequency> getPayFrequencyById(@PathVariable Long id) {
        return payFrequencyRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/pay-frequencies")
    public ResponseEntity<PayFrequency> createPayFrequency(@RequestBody PayFrequency payFrequency) {
        return ResponseEntity.ok(payFrequencyRepository.save(payFrequency));
    }

    @PutMapping("/pay-frequencies/{id}")
    public ResponseEntity<PayFrequency> updatePayFrequency(@PathVariable Long id, @RequestBody PayFrequency payFrequency) {
        return payFrequencyRepository.findById(id)
            .map(existing -> {
                payFrequency.setId(id);
                payFrequency.setCreatedAt(existing.getCreatedAt());
                return ResponseEntity.ok(payFrequencyRepository.save(payFrequency));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/pay-frequencies/{id}")
    public ResponseEntity<Void> deletePayFrequency(@PathVariable Long id) {
        if (payFrequencyRepository.existsById(id)) {
            payFrequencyRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/overtime-rules")
    public ResponseEntity<List<OvertimeRule>> getAllOvertimeRules() {
        return ResponseEntity.ok(overtimeRuleRepository.findByIsActiveTrueOrderByPriorityAsc());
    }

    @GetMapping("/overtime-rules/all")
    public ResponseEntity<List<OvertimeRule>> getAllOvertimeRulesIncludingInactive() {
        return ResponseEntity.ok(overtimeRuleRepository.findAll());
    }

    @GetMapping("/overtime-rules/{id}")
    public ResponseEntity<OvertimeRule> getOvertimeRuleById(@PathVariable Long id) {
        return overtimeRuleRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/overtime-rules")
    public ResponseEntity<OvertimeRule> createOvertimeRule(@RequestBody OvertimeRule overtimeRule) {
        return ResponseEntity.ok(overtimeRuleRepository.save(overtimeRule));
    }

    @PutMapping("/overtime-rules/{id}")
    public ResponseEntity<OvertimeRule> updateOvertimeRule(@PathVariable Long id, @RequestBody OvertimeRule overtimeRule) {
        return overtimeRuleRepository.findById(id)
            .map(existing -> {
                overtimeRule.setId(id);
                overtimeRule.setCreatedAt(existing.getCreatedAt());
                return ResponseEntity.ok(overtimeRuleRepository.save(overtimeRule));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/overtime-rules/{id}")
    public ResponseEntity<Void> deleteOvertimeRule(@PathVariable Long id) {
        if (overtimeRuleRepository.existsById(id)) {
            overtimeRuleRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/tax-rules")
    public ResponseEntity<List<TaxRule>> getAllTaxRules() {
        return ResponseEntity.ok(taxRuleRepository.findByIsActiveTrue());
    }

    @GetMapping("/tax-rules/all")
    public ResponseEntity<List<TaxRule>> getAllTaxRulesIncludingInactive() {
        return ResponseEntity.ok(taxRuleRepository.findAll());
    }

    @GetMapping("/tax-rules/{id}")
    public ResponseEntity<TaxRule> getTaxRuleById(@PathVariable Long id) {
        return taxRuleRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/tax-rules/type/{type}")
    public ResponseEntity<List<TaxRule>> getTaxRulesByType(@PathVariable String type) {
        return ResponseEntity.ok(taxRuleRepository.findByTaxTypeAndIsActiveTrue(type));
    }

    @PostMapping("/tax-rules")
    public ResponseEntity<TaxRule> createTaxRule(@RequestBody TaxRule taxRule) {
        return ResponseEntity.ok(taxRuleRepository.save(taxRule));
    }

    @PutMapping("/tax-rules/{id}")
    public ResponseEntity<TaxRule> updateTaxRule(@PathVariable Long id, @RequestBody TaxRule taxRule) {
        return taxRuleRepository.findById(id)
            .map(existing -> {
                taxRule.setId(id);
                taxRule.setCreatedAt(existing.getCreatedAt());
                return ResponseEntity.ok(taxRuleRepository.save(taxRule));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/tax-rules/{id}")
    public ResponseEntity<Void> deleteTaxRule(@PathVariable Long id) {
        if (taxRuleRepository.existsById(id)) {
            taxRuleRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/statutory-rules")
    public ResponseEntity<List<StatutoryRule>> getAllStatutoryRules() {
        return ResponseEntity.ok(statutoryRuleRepository.findByIsActiveTrue());
    }

    @GetMapping("/statutory-rules/all")
    public ResponseEntity<List<StatutoryRule>> getAllStatutoryRulesIncludingInactive() {
        return ResponseEntity.ok(statutoryRuleRepository.findAll());
    }

    @GetMapping("/statutory-rules/{id}")
    public ResponseEntity<StatutoryRule> getStatutoryRuleById(@PathVariable Long id) {
        return statutoryRuleRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/statutory-rules")
    public ResponseEntity<StatutoryRule> createStatutoryRule(@RequestBody StatutoryRule statutoryRule) {
        return ResponseEntity.ok(statutoryRuleRepository.save(statutoryRule));
    }

    @PutMapping("/statutory-rules/{id}")
    public ResponseEntity<StatutoryRule> updateStatutoryRule(@PathVariable Long id, @RequestBody StatutoryRule statutoryRule) {
        return statutoryRuleRepository.findById(id)
            .map(existing -> {
                statutoryRule.setId(id);
                statutoryRule.setCreatedAt(existing.getCreatedAt());
                return ResponseEntity.ok(statutoryRuleRepository.save(statutoryRule));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/statutory-rules/{id}")
    public ResponseEntity<Void> deleteStatutoryRule(@PathVariable Long id) {
        if (statutoryRuleRepository.existsById(id)) {
            statutoryRuleRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
