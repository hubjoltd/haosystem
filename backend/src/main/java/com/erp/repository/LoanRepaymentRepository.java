package com.erp.repository;

import com.erp.model.LoanRepayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LoanRepaymentRepository extends JpaRepository<LoanRepayment, Long> {
    List<LoanRepayment> findByLoanId(Long loanId);
    
    List<LoanRepayment> findByStatus(String status);
    
    @Query("SELECT lr FROM LoanRepayment lr WHERE lr.loan.id = :loanId ORDER BY lr.installmentNumber")
    List<LoanRepayment> findByLoanIdOrderByInstallment(@Param("loanId") Long loanId);
    
    @Query("SELECT lr FROM LoanRepayment lr WHERE lr.status = 'PENDING' AND lr.dueDate <= :date")
    List<LoanRepayment> findDueRepayments(@Param("date") LocalDate date);
    
    @Query("SELECT lr FROM LoanRepayment lr WHERE lr.status = 'PENDING' AND lr.dueDate < :today")
    List<LoanRepayment> findOverdueRepayments(@Param("today") LocalDate today);
    
    @Query("SELECT lr FROM LoanRepayment lr WHERE lr.loan.employee.id = :employeeId AND lr.status = 'PENDING' AND lr.dueDate BETWEEN :start AND :end")
    List<LoanRepayment> findUpcomingRepaymentsByEmployee(@Param("employeeId") Long employeeId, @Param("start") LocalDate start, @Param("end") LocalDate end);
    
    @Query("SELECT SUM(lr.principalAmount + lr.interestAmount) FROM LoanRepayment lr WHERE lr.loan.id = :loanId AND lr.status = 'PAID'")
    java.math.BigDecimal getTotalPaidByLoan(@Param("loanId") Long loanId);
}
