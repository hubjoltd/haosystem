package com.erp.repository;

import com.erp.model.PayrollRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRunRepository extends JpaRepository<PayrollRun, Long> {
    
    Optional<PayrollRun> findByPayrollRunNumber(String payrollRunNumber);
    
    List<PayrollRun> findByStatus(String status);
    
    List<PayrollRun> findByPeriodStartDateBetween(LocalDate startDate, LocalDate endDate);
    
    List<PayrollRun> findByPayDateBetween(LocalDate startDate, LocalDate endDate);
    
    Optional<PayrollRun> findByPeriodStartDateAndPeriodEndDate(LocalDate startDate, LocalDate endDate);
    
    List<PayrollRun> findAllByOrderByCreatedAtDesc();
}
