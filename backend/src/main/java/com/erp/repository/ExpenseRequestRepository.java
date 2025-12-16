package com.erp.repository;

import com.erp.model.ExpenseRequest;
import com.erp.model.Employee;
import com.erp.model.CostCenter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRequestRepository extends JpaRepository<ExpenseRequest, Long> {
    Optional<ExpenseRequest> findByRequestNumber(String requestNumber);
    List<ExpenseRequest> findByEmployee(Employee employee);
    List<ExpenseRequest> findByEmployeeOrderByCreatedAtDesc(Employee employee);
    List<ExpenseRequest> findByStatus(String status);
    List<ExpenseRequest> findByApprover(Employee approver);
    List<ExpenseRequest> findByApproverAndStatus(Employee approver, String status);
    List<ExpenseRequest> findByCostCenter(CostCenter costCenter);
    List<ExpenseRequest> findByReimbursementStatus(String reimbursementStatus);
    List<ExpenseRequest> findByPostedToAccounts(Boolean postedToAccounts);
    
    @Query("SELECT e FROM ExpenseRequest e WHERE e.status = :status AND e.approver = :approver ORDER BY e.submittedAt ASC")
    List<ExpenseRequest> findPendingApprovalsByApprover(@Param("approver") Employee approver, @Param("status") String status);
    
    @Query("SELECT e FROM ExpenseRequest e WHERE e.expenseDate BETWEEN :startDate AND :endDate")
    List<ExpenseRequest> findByExpenseDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT e FROM ExpenseRequest e WHERE e.status = 'APPROVED' AND e.reimbursementRequired = true AND e.reimbursementStatus = 'PENDING'")
    List<ExpenseRequest> findPendingReimbursements();
    
    @Query("SELECT e FROM ExpenseRequest e WHERE e.status = 'APPROVED' AND e.postedToAccounts = false")
    List<ExpenseRequest> findApprovedNotPosted();
    
    @Query("SELECT COUNT(e) FROM ExpenseRequest e WHERE e.status = :status")
    Long countByStatus(@Param("status") String status);
    
    @Query("SELECT SUM(e.totalAmount) FROM ExpenseRequest e WHERE e.employee = :employee AND e.status = 'APPROVED'")
    java.math.BigDecimal sumApprovedAmountByEmployee(@Param("employee") Employee employee);
}
