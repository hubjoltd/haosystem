package com.erp.repository;

import com.erp.model.EmployeeDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EmployeeDocumentRepository extends JpaRepository<EmployeeDocument, Long> {
    List<EmployeeDocument> findByEmployeeId(Long employeeId);
    
    List<EmployeeDocument> findByEmployeeIdAndDocumentTypeCategoryId(Long employeeId, Long categoryId);
    
    List<EmployeeDocument> findByVerificationStatus(String status);
    
    @Query("SELECT d FROM EmployeeDocument d WHERE d.expiryDate IS NOT NULL AND d.expiryDate <= :expiryDate")
    List<EmployeeDocument> findExpiringDocuments(@Param("expiryDate") LocalDate expiryDate);
    
    @Query("SELECT d FROM EmployeeDocument d WHERE d.expiryDate IS NOT NULL AND d.expiryDate <= :expiryDate AND d.reminderSent = false")
    List<EmployeeDocument> findExpiringDocumentsForReminder(@Param("expiryDate") LocalDate expiryDate);
    
    @Query("SELECT d FROM EmployeeDocument d WHERE d.expiryDate IS NOT NULL AND d.expiryDate < :today")
    List<EmployeeDocument> findExpiredDocuments(@Param("today") LocalDate today);
    
    @Query("SELECT d FROM EmployeeDocument d WHERE d.employee.id = :employeeId AND d.documentType.isMandatory = true")
    List<EmployeeDocument> findMandatoryDocumentsByEmployee(@Param("employeeId") Long employeeId);
    
    @Query("SELECT COUNT(d) FROM EmployeeDocument d WHERE d.employee.id = :employeeId AND d.verificationStatus = 'VERIFIED'")
    Long countVerifiedDocumentsByEmployee(@Param("employeeId") Long employeeId);
    
    @Query("SELECT COUNT(d) FROM EmployeeDocument d WHERE d.employee.id = :employeeId AND d.verificationStatus = 'PENDING'")
    Long countPendingDocumentsByEmployee(@Param("employeeId") Long employeeId);
}
