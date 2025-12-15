package com.erp.controller;

import com.erp.model.PurchaseRequisition;
import com.erp.model.User;
import com.erp.repository.UserRepository;
import com.erp.service.PurchaseRequisitionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/purchase/requisitions")
@CrossOrigin(origins = "*")
public class PurchaseRequisitionController {

    @Autowired
    private PurchaseRequisitionService prService;
    
    @Autowired
    private UserRepository userRepository;
    
    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            return null;
        }
        return userRepository.findByUsername(auth.getName()).orElse(null);
    }

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
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            String submittedBy = user.getFirstName() != null && user.getLastName() != null ? 
                    user.getFirstName() + " " + user.getLastName() : user.getUsername();
            return ResponseEntity.ok(prService.submit(id, submittedBy, user.getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<PurchaseRequisition> approve(@PathVariable Long id) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            String approvedBy = user.getFirstName() != null && user.getLastName() != null ? 
                    user.getFirstName() + " " + user.getLastName() : user.getUsername();
            return ResponseEntity.ok(prService.approve(id, approvedBy, user.getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<PurchaseRequisition> reject(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            String rejectedBy = user.getFirstName() != null && user.getLastName() != null ? 
                    user.getFirstName() + " " + user.getLastName() : user.getUsername();
            String reason = body != null ? body.get("reason") : null;
            return ResponseEntity.ok(prService.reject(id, rejectedBy, user.getId(), reason));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
