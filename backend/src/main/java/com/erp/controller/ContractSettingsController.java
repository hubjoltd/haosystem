package com.erp.controller;

import com.erp.model.ContractType;
import com.erp.model.ContractStatus;
import com.erp.repository.ContractTypeRepository;
import com.erp.repository.ContractStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/settings/contract")
@CrossOrigin(origins = "*")
public class ContractSettingsController {

    @Autowired
    private ContractTypeRepository contractTypeRepository;

    @Autowired
    private ContractStatusRepository contractStatusRepository;

    @GetMapping("/types")
    public ResponseEntity<List<ContractType>> getAllTypes() {
        return ResponseEntity.ok(contractTypeRepository.findAll());
    }

    @PostMapping("/types")
    public ResponseEntity<ContractType> createType(@RequestBody ContractType type) {
        return ResponseEntity.ok(contractTypeRepository.save(type));
    }

    @PutMapping("/types/{id}")
    public ResponseEntity<ContractType> updateType(@PathVariable Long id, @RequestBody ContractType type) {
        return contractTypeRepository.findById(id)
            .map(existing -> {
                existing.setName(type.getName());
                existing.setDuration(type.getDuration());
                existing.setRenewable(type.getRenewable());
                return ResponseEntity.ok(contractTypeRepository.save(existing));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/types/{id}")
    public ResponseEntity<Void> deleteType(@PathVariable Long id) {
        if (contractTypeRepository.existsById(id)) {
            contractTypeRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/statuses")
    public ResponseEntity<List<ContractStatus>> getAllStatuses() {
        return ResponseEntity.ok(contractStatusRepository.findAll());
    }

    @PostMapping("/statuses")
    public ResponseEntity<ContractStatus> createStatus(@RequestBody ContractStatus status) {
        return ResponseEntity.ok(contractStatusRepository.save(status));
    }

    @PutMapping("/statuses/{id}")
    public ResponseEntity<ContractStatus> updateStatus(@PathVariable Long id, @RequestBody ContractStatus status) {
        return contractStatusRepository.findById(id)
            .map(existing -> {
                existing.setName(status.getName());
                existing.setColor(status.getColor());
                return ResponseEntity.ok(contractStatusRepository.save(existing));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/statuses/{id}")
    public ResponseEntity<Void> deleteStatus(@PathVariable Long id) {
        if (contractStatusRepository.existsById(id)) {
            contractStatusRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
