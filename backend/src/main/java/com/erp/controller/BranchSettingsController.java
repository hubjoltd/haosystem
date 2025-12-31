package com.erp.controller;

import com.erp.model.Branch;
import com.erp.model.BranchSettings;
import com.erp.repository.BranchRepository;
import com.erp.repository.BranchSettingsRepository;
import com.erp.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/branches/{branchId}/settings")
public class BranchSettingsController {
    
    @Autowired
    private BranchSettingsRepository branchSettingsRepository;
    
    @Autowired
    private BranchRepository branchRepository;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    private static final String UPLOAD_DIR = "uploads/logos/";
    
    private String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
    
    private boolean isSuperAdmin(HttpServletRequest request) {
        String token = extractToken(request);
        if (token == null) return false;
        try {
            return jwtUtil.extractIsSuperAdmin(token);
        } catch (Exception e) {
            return false;
        }
    }
    
    private ResponseEntity<?> forbiddenResponse() {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Access denied. Super admin privileges required.");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }
    
    @GetMapping
    public ResponseEntity<?> getBranchSettings(@PathVariable Long branchId, HttpServletRequest request) {
        if (!isSuperAdmin(request)) {
            return forbiddenResponse();
        }
        
        Branch branch = branchRepository.findById(branchId).orElse(null);
        if (branch == null) {
            return ResponseEntity.notFound().build();
        }
        
        BranchSettings settings = branchSettingsRepository.findByBranchId(branchId)
            .orElseGet(() -> createDefaultSettings(branch));
        
        return ResponseEntity.ok(settings);
    }
    
    @PutMapping
    public ResponseEntity<?> updateBranchSettings(@PathVariable Long branchId, 
                                                   @RequestBody BranchSettings settingsUpdate, 
                                                   HttpServletRequest request) {
        if (!isSuperAdmin(request)) {
            return forbiddenResponse();
        }
        
        Branch branch = branchRepository.findById(branchId).orElse(null);
        if (branch == null) {
            return ResponseEntity.notFound().build();
        }
        
        BranchSettings existing = branchSettingsRepository.findByBranchId(branchId)
            .orElseGet(() -> createDefaultSettings(branch));
        
        if (settingsUpdate.getCompanyLegalName() != null) existing.setCompanyLegalName(settingsUpdate.getCompanyLegalName());
        if (settingsUpdate.getDisplayName() != null) existing.setDisplayName(settingsUpdate.getDisplayName());
        if (settingsUpdate.getTaxRegistrationNumber() != null) existing.setTaxRegistrationNumber(settingsUpdate.getTaxRegistrationNumber());
        if (settingsUpdate.getBusinessRegistrationNumber() != null) existing.setBusinessRegistrationNumber(settingsUpdate.getBusinessRegistrationNumber());
        if (settingsUpdate.getFiscalYearStartMonth() != null) existing.setFiscalYearStartMonth(settingsUpdate.getFiscalYearStartMonth());
        if (settingsUpdate.getTimeFormat() != null) existing.setTimeFormat(settingsUpdate.getTimeFormat());
        if (settingsUpdate.getNumberFormat() != null) existing.setNumberFormat(settingsUpdate.getNumberFormat());
        if (settingsUpdate.getCurrencySymbol() != null) existing.setCurrencySymbol(settingsUpdate.getCurrencySymbol());
        if (settingsUpdate.getCurrencyPosition() != null) existing.setCurrencyPosition(settingsUpdate.getCurrencyPosition());
        if (settingsUpdate.getDefaultTaxRate() != null) existing.setDefaultTaxRate(settingsUpdate.getDefaultTaxRate());
        if (settingsUpdate.getTaxLabel() != null) existing.setTaxLabel(settingsUpdate.getTaxLabel());
        if (settingsUpdate.getInvoicePrefix() != null) existing.setInvoicePrefix(settingsUpdate.getInvoicePrefix());
        if (settingsUpdate.getInvoiceNextNumber() != null) existing.setInvoiceNextNumber(settingsUpdate.getInvoiceNextNumber());
        if (settingsUpdate.getPurchaseOrderPrefix() != null) existing.setPurchaseOrderPrefix(settingsUpdate.getPurchaseOrderPrefix());
        if (settingsUpdate.getPurchaseOrderNextNumber() != null) existing.setPurchaseOrderNextNumber(settingsUpdate.getPurchaseOrderNextNumber());
        if (settingsUpdate.getQuotationPrefix() != null) existing.setQuotationPrefix(settingsUpdate.getQuotationPrefix());
        if (settingsUpdate.getQuotationNextNumber() != null) existing.setQuotationNextNumber(settingsUpdate.getQuotationNextNumber());
        if (settingsUpdate.getReceiptPrefix() != null) existing.setReceiptPrefix(settingsUpdate.getReceiptPrefix());
        if (settingsUpdate.getReceiptNextNumber() != null) existing.setReceiptNextNumber(settingsUpdate.getReceiptNextNumber());
        if (settingsUpdate.getPayrollPrefix() != null) existing.setPayrollPrefix(settingsUpdate.getPayrollPrefix());
        if (settingsUpdate.getPayrollNextNumber() != null) existing.setPayrollNextNumber(settingsUpdate.getPayrollNextNumber());
        if (settingsUpdate.getDefaultPaymentTerms() != null) existing.setDefaultPaymentTerms(settingsUpdate.getDefaultPaymentTerms());
        if (settingsUpdate.getInvoiceDueDays() != null) existing.setInvoiceDueDays(settingsUpdate.getInvoiceDueDays());
        if (settingsUpdate.getInvoiceFooter() != null) existing.setInvoiceFooter(settingsUpdate.getInvoiceFooter());
        if (settingsUpdate.getInvoiceTerms() != null) existing.setInvoiceTerms(settingsUpdate.getInvoiceTerms());
        if (settingsUpdate.getLetterhead() != null) existing.setLetterhead(settingsUpdate.getLetterhead());
        if (settingsUpdate.getPrimaryColor() != null) existing.setPrimaryColor(settingsUpdate.getPrimaryColor());
        if (settingsUpdate.getSecondaryColor() != null) existing.setSecondaryColor(settingsUpdate.getSecondaryColor());
        if (settingsUpdate.getShowLogoOnInvoices() != null) existing.setShowLogoOnInvoices(settingsUpdate.getShowLogoOnInvoices());
        if (settingsUpdate.getShowLogoOnReports() != null) existing.setShowLogoOnReports(settingsUpdate.getShowLogoOnReports());
        if (settingsUpdate.getAutoGenerateEmployeeId() != null) existing.setAutoGenerateEmployeeId(settingsUpdate.getAutoGenerateEmployeeId());
        if (settingsUpdate.getEmployeeIdPrefix() != null) existing.setEmployeeIdPrefix(settingsUpdate.getEmployeeIdPrefix());
        if (settingsUpdate.getEmployeeIdNextNumber() != null) existing.setEmployeeIdNextNumber(settingsUpdate.getEmployeeIdNextNumber());
        existing.setUpdatedAt(LocalDateTime.now());
        
        BranchSettings saved = branchSettingsRepository.save(existing);
        return ResponseEntity.ok(saved);
    }
    
    @PostMapping("/logo")
    public ResponseEntity<?> uploadLogo(@PathVariable Long branchId,
                                        @RequestParam("file") MultipartFile file,
                                        HttpServletRequest request) {
        if (!isSuperAdmin(request)) {
            return forbiddenResponse();
        }
        
        Branch branch = branchRepository.findById(branchId).orElse(null);
        if (branch == null) {
            return ResponseEntity.notFound().build();
        }
        
        if (file.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Please select a file to upload");
            return ResponseEntity.badRequest().body(error);
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Only image files are allowed");
            return ResponseEntity.badRequest().body(error);
        }
        
        if (file.getSize() > 5 * 1024 * 1024) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "File size must be less than 5MB");
            return ResponseEntity.badRequest().body(error);
        }
        
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = "branch_" + branchId + "_" + UUID.randomUUID().toString() + extension;
            
            Path filePath = uploadPath.resolve(filename);
            Files.write(filePath, file.getBytes());
            
            String logoPath = "/" + UPLOAD_DIR + filename;
            branch.setLogoPath(logoPath);
            branch.setUpdatedAt(LocalDateTime.now());
            branchRepository.save(branch);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Logo uploaded successfully");
            response.put("logoPath", logoPath);
            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to upload file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @PostMapping("/signature")
    public ResponseEntity<?> uploadSignature(@PathVariable Long branchId,
                                              @RequestParam("file") MultipartFile file,
                                              HttpServletRequest request) {
        if (!isSuperAdmin(request)) {
            return forbiddenResponse();
        }
        
        Branch branch = branchRepository.findById(branchId).orElse(null);
        if (branch == null) {
            return ResponseEntity.notFound().build();
        }
        
        BranchSettings settings = branchSettingsRepository.findByBranchId(branchId)
            .orElseGet(() -> createDefaultSettings(branch));
        
        if (file.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Please select a file to upload");
            return ResponseEntity.badRequest().body(error);
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Only image files are allowed");
            return ResponseEntity.badRequest().body(error);
        }
        
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR + "signatures/");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = "signature_" + branchId + "_" + UUID.randomUUID().toString() + extension;
            
            Path filePath = uploadPath.resolve(filename);
            Files.write(filePath, file.getBytes());
            
            String signaturePath = "/" + UPLOAD_DIR + "signatures/" + filename;
            settings.setSignaturePath(signaturePath);
            settings.setUpdatedAt(LocalDateTime.now());
            branchSettingsRepository.save(settings);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Signature uploaded successfully");
            response.put("signaturePath", signaturePath);
            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to upload file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    private BranchSettings createDefaultSettings(Branch branch) {
        BranchSettings settings = new BranchSettings();
        settings.setBranch(branch);
        settings.setCompanyLegalName(branch.getName());
        settings.setDisplayName(branch.getName());
        settings.setCreatedAt(LocalDateTime.now());
        settings.setUpdatedAt(LocalDateTime.now());
        return branchSettingsRepository.save(settings);
    }
}
