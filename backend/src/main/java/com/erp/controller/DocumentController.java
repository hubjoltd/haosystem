package com.erp.controller;

import com.erp.model.*;
import com.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.erp.service.DocumentExpiryScheduler;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
public class DocumentController {

    @Autowired
    private DocumentCategoryRepository categoryRepository;
    
    @Autowired
    private DocumentTypeRepository typeRepository;
    
    @Autowired
    private EmployeeDocumentRepository documentRepository;
    
    @Autowired
    private EmployeeRepository employeeRepository;
    
    @Autowired
    private DocumentExpiryScheduler expiryScheduler;

    @GetMapping("/categories")
    public List<DocumentCategory> getAllCategories() {
        return categoryRepository.findByActiveTrueOrderBySortOrderAsc();
    }
    
    @GetMapping("/categories/all")
    public List<DocumentCategory> getAllCategoriesIncludingInactive() {
        return categoryRepository.findAll();
    }

    @GetMapping("/categories/{id}")
    public ResponseEntity<DocumentCategory> getCategoryById(@PathVariable Long id) {
        return categoryRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/categories")
    public DocumentCategory createCategory(@RequestBody DocumentCategory category) {
        return categoryRepository.save(category);
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<DocumentCategory> updateCategory(@PathVariable Long id, @RequestBody DocumentCategory category) {
        return categoryRepository.findById(id)
                .map(existing -> {
                    category.setId(id);
                    category.setCreatedAt(existing.getCreatedAt());
                    return ResponseEntity.ok(categoryRepository.save(category));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        return categoryRepository.findById(id)
                .map(category -> {
                    categoryRepository.delete(category);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/types")
    public List<DocumentType> getAllTypes() {
        return typeRepository.findByActiveTrueOrderBySortOrderAsc();
    }
    
    @GetMapping("/types/all")
    public List<DocumentType> getAllTypesIncludingInactive() {
        return typeRepository.findAll();
    }
    
    @GetMapping("/types/by-category/{categoryId}")
    public List<DocumentType> getTypesByCategory(@PathVariable Long categoryId) {
        return typeRepository.findByCategoryIdAndActiveTrueOrderBySortOrderAsc(categoryId);
    }
    
    @GetMapping("/types/mandatory")
    public List<DocumentType> getMandatoryTypes() {
        return typeRepository.findByIsMandatoryTrue();
    }

    @GetMapping("/types/{id}")
    public ResponseEntity<DocumentType> getTypeById(@PathVariable Long id) {
        return typeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/types")
    public DocumentType createType(@RequestBody DocumentType type) {
        return typeRepository.save(type);
    }

    @PutMapping("/types/{id}")
    public ResponseEntity<DocumentType> updateType(@PathVariable Long id, @RequestBody DocumentType type) {
        return typeRepository.findById(id)
                .map(existing -> {
                    type.setId(id);
                    type.setCreatedAt(existing.getCreatedAt());
                    return ResponseEntity.ok(typeRepository.save(type));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/types/{id}")
    public ResponseEntity<Void> deleteType(@PathVariable Long id) {
        return typeRepository.findById(id)
                .map(type -> {
                    typeRepository.delete(type);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/employee/{employeeId}")
    public List<EmployeeDocument> getEmployeeDocuments(@PathVariable Long employeeId) {
        return documentRepository.findByEmployeeId(employeeId);
    }
    
    @GetMapping("/employee/{employeeId}/category/{categoryId}")
    public List<EmployeeDocument> getEmployeeDocumentsByCategory(@PathVariable Long employeeId, @PathVariable Long categoryId) {
        return documentRepository.findByEmployeeIdAndDocumentTypeCategoryId(employeeId, categoryId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeDocument> getDocumentById(@PathVariable Long id) {
        return documentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/employee/{employeeId}")
    public EmployeeDocument createDocument(@PathVariable Long employeeId, @RequestBody EmployeeDocument document, Authentication auth) {
        return employeeRepository.findById(employeeId)
                .map(emp -> {
                    document.setEmployee(emp);
                    document.setUploadedBy(auth != null ? auth.getName() : "system");
                    if (document.getReminderDays() == null && document.getDocumentType() != null) {
                        document.setReminderDays(document.getDocumentType().getDefaultReminderDays());
                    }
                    return documentRepository.save(document);
                })
                .orElseThrow(() -> new RuntimeException("Employee not found"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeDocument> updateDocument(@PathVariable Long id, @RequestBody EmployeeDocument document) {
        return documentRepository.findById(id)
                .map(existing -> {
                    document.setId(id);
                    document.setEmployee(existing.getEmployee());
                    document.setCreatedAt(existing.getCreatedAt());
                    document.setUploadedBy(existing.getUploadedBy());
                    document.setUploadedAt(existing.getUploadedAt());
                    return ResponseEntity.ok(documentRepository.save(document));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<EmployeeDocument> verifyDocument(@PathVariable Long id, @RequestParam String status, 
            @RequestParam(required = false) String remarks, Authentication auth) {
        return documentRepository.findById(id)
                .map(document -> {
                    document.setVerificationStatus(status);
                    document.setVerifiedBy(auth != null ? auth.getName() : "admin");
                    document.setVerifiedAt(LocalDateTime.now());
                    document.setVerificationRemarks(remarks);
                    return ResponseEntity.ok(documentRepository.save(document));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        return documentRepository.findById(id)
                .map(document -> {
                    documentRepository.delete(document);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/pending-verification")
    public List<EmployeeDocument> getPendingVerification() {
        return documentRepository.findByVerificationStatus("PENDING");
    }

    @GetMapping("/expiring")
    public List<EmployeeDocument> getExpiringDocuments(@RequestParam(defaultValue = "30") int days) {
        LocalDate expiryDate = LocalDate.now().plusDays(days);
        return documentRepository.findExpiringDocuments(expiryDate);
    }

    @GetMapping("/expired")
    public List<EmployeeDocument> getExpiredDocuments() {
        return documentRepository.findExpiredDocuments(LocalDate.now());
    }

    @GetMapping("/employee/{employeeId}/stats")
    public Map<String, Object> getEmployeeDocumentStats(@PathVariable Long employeeId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("verified", documentRepository.countVerifiedDocumentsByEmployee(employeeId));
        stats.put("pending", documentRepository.countPendingDocumentsByEmployee(employeeId));
        stats.put("total", documentRepository.findByEmployeeId(employeeId).size());
        return stats;
    }

    @PostMapping("/init-categories")
    public ResponseEntity<String> initializeCategories() {
        if (categoryRepository.count() > 0) {
            return ResponseEntity.ok("Categories already initialized");
        }
        
        String[][] categories = {
            {"ID_WORK_AUTH", "Identification & Work Authorization", "Driver's License, Passport, SSN, Work Visa, I-94, EAD, Green Card"},
            {"TAX_PAYROLL", "Tax & Payroll Documents", "W-4, W-9, State Tax Forms, Voided Check/Bank Letter"},
            {"EMPLOYMENT_HR", "Employment & HR Documents", "Offer Letter, Employment Contract, NDA, Job Description, Handbook Acknowledgement"},
            {"FEDERAL_COMPLIANCE", "Federal Compliance Forms", "I-9 Employment Eligibility, E-Verify Confirmation"},
            {"CERTIFICATIONS", "Certifications & Licenses", "Professional Licenses, Safety Certifications (OSHA, CPR)"},
            {"OTHER", "Other Documents", "Resume, Reference Letters, Training Records/Certificates"}
        };
        
        for (int i = 0; i < categories.length; i++) {
            DocumentCategory cat = new DocumentCategory();
            cat.setCode(categories[i][0]);
            cat.setName(categories[i][1]);
            cat.setDescription(categories[i][2]);
            cat.setSortOrder(i + 1);
            cat.setActive(true);
            categoryRepository.save(cat);
        }
        
        return ResponseEntity.ok("Initialized 6 document categories");
    }

    @PostMapping("/check-expiry")
    public Map<String, Object> triggerExpiryCheck() {
        int[] results = expiryScheduler.processExpiringDocuments();
        Map<String, Object> result = new HashMap<>();
        result.put("processed", results[0]);
        result.put("notifications", results[1]);
        return result;
    }

    @PutMapping("/{id}/reset-reminder")
    public ResponseEntity<EmployeeDocument> resetReminder(@PathVariable Long id) {
        return documentRepository.findById(id)
                .map(document -> {
                    document.setReminderSent(false);
                    return ResponseEntity.ok(documentRepository.save(document));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
