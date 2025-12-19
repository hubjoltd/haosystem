package com.erp.repository;

import com.erp.model.LoanApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoanApplicationRepository extends JpaRepository<LoanApplication, Long> {
    Optional<LoanApplication> findByApplicationNumber(String applicationNumber);
    
    List<LoanApplication> findByEmployeeId(Long employeeId);
    
    List<LoanApplication> findByStatus(String status);
    
    List<LoanApplication> findByLoanType(String loanType);
    
    @Query("SELECT la FROM LoanApplication la WHERE la.employee.id = :employeeId AND la.status IN ('APPROVED', 'DISBURSED', 'ACTIVE')")
    List<LoanApplication> findActiveLoansForEmployee(@Param("employeeId") Long employeeId);
    
    @Query("SELECT la FROM LoanApplication la WHERE la.status = 'PENDING_APPROVAL'")
    List<LoanApplication> findPendingApproval();
    
    @Query("SELECT la FROM LoanApplication la WHERE la.status = 'ACTIVE' AND la.outstandingBalance > 0")
    List<LoanApplication> findLoansWithOutstandingBalance();
    
    @Query("SELECT SUM(la.outstandingBalance) FROM LoanApplication la WHERE la.employee.id = :employeeId AND la.status = 'ACTIVE'")
    java.math.BigDecimal getTotalOutstandingByEmployee(@Param("employeeId") Long employeeId);
}
