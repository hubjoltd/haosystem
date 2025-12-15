package com.erp.controller;

import com.erp.model.CustomerGroup;
import com.erp.model.CustomerStatus;
import com.erp.repository.CustomerGroupRepository;
import com.erp.repository.CustomerStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/settings/customer")
@CrossOrigin(origins = "*")
public class CustomerSettingsController {

    @Autowired
    private CustomerGroupRepository customerGroupRepository;

    @Autowired
    private CustomerStatusRepository customerStatusRepository;

    // Customer Groups endpoints
    @GetMapping("/groups")
    public ResponseEntity<List<CustomerGroup>> getAllGroups() {
        return ResponseEntity.ok(customerGroupRepository.findAll());
    }

    @GetMapping("/groups/{id}")
    public ResponseEntity<CustomerGroup> getGroupById(@PathVariable Long id) {
        return customerGroupRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/groups")
    public ResponseEntity<CustomerGroup> createGroup(@RequestBody CustomerGroup group) {
        CustomerGroup saved = customerGroupRepository.save(group);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/groups/{id}")
    public ResponseEntity<CustomerGroup> updateGroup(@PathVariable Long id, @RequestBody CustomerGroup group) {
        return customerGroupRepository.findById(id)
            .map(existing -> {
                existing.setName(group.getName());
                existing.setDescription(group.getDescription());
                existing.setDiscount(group.getDiscount());
                return ResponseEntity.ok(customerGroupRepository.save(existing));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/groups/{id}")
    public ResponseEntity<Void> deleteGroup(@PathVariable Long id) {
        if (customerGroupRepository.existsById(id)) {
            customerGroupRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Customer Statuses endpoints
    @GetMapping("/statuses")
    public ResponseEntity<List<CustomerStatus>> getAllStatuses() {
        return ResponseEntity.ok(customerStatusRepository.findAll());
    }

    @GetMapping("/statuses/{id}")
    public ResponseEntity<CustomerStatus> getStatusById(@PathVariable Long id) {
        return customerStatusRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/statuses")
    public ResponseEntity<CustomerStatus> createStatus(@RequestBody CustomerStatus status) {
        CustomerStatus saved = customerStatusRepository.save(status);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/statuses/{id}")
    public ResponseEntity<CustomerStatus> updateStatus(@PathVariable Long id, @RequestBody CustomerStatus status) {
        return customerStatusRepository.findById(id)
            .map(existing -> {
                existing.setName(status.getName());
                existing.setColor(status.getColor());
                return ResponseEntity.ok(customerStatusRepository.save(existing));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/statuses/{id}")
    public ResponseEntity<Void> deleteStatus(@PathVariable Long id) {
        if (customerStatusRepository.existsById(id)) {
            customerStatusRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
