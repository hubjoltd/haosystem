package com.erp.repository;

import com.erp.model.ExpenseItem;
import com.erp.model.ExpenseRequest;
import com.erp.model.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseItemRepository extends JpaRepository<ExpenseItem, Long> {
    List<ExpenseItem> findByExpenseRequest(ExpenseRequest expenseRequest);
    List<ExpenseItem> findByCategory(ExpenseCategory category);
    List<ExpenseItem> findByExpenseDateBetween(LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT SUM(e.amount) FROM ExpenseItem e WHERE e.category = :category")
    java.math.BigDecimal sumAmountByCategory(@Param("category") ExpenseCategory category);
    
    @Query("SELECT SUM(e.amount) FROM ExpenseItem e WHERE e.expenseDate BETWEEN :startDate AND :endDate")
    java.math.BigDecimal sumAmountByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
