package com.erp.repository;

import com.erp.model.PayrollRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PayrollRecordRepository extends JpaRepository<PayrollRecord, Long> {
    
    List<PayrollRecord> findByPayrollRunId(Long payrollRunId);
    
    List<PayrollRecord> findByEmployeeId(Long employeeId);
    
    List<PayrollRecord> findByStatus(String status);
    
    List<PayrollRecord> findByPayrollRunIdAndStatus(Long payrollRunId, String status);
    
    @Query("SELECT pr FROM PayrollRecord pr WHERE pr.employee.id = :employeeId ORDER BY pr.createdAt DESC")
    List<PayrollRecord> findByEmployeeIdOrderByCreatedAtDesc(@Param("employeeId") Long employeeId);
    
    @Query("SELECT pr FROM PayrollRecord pr JOIN pr.payrollRun p WHERE pr.employee.id = :employeeId AND (p.status = 'PROCESSED' OR p.status = 'FULLY_PROCESSED' OR p.status = 'PARTIALLY_PROCESSED' OR p.status = 'COMPLETED' OR pr.payStatus = 'PAID') ORDER BY p.payDate DESC")
    List<PayrollRecord> findProcessedPayrollRecordsByEmployee(@Param("employeeId") Long employeeId);
}
