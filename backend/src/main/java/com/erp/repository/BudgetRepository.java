package com.erp.repository;

import com.erp.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByFiscalYearOrderByName(Integer fiscalYear);
    List<Budget> findByStatusOrderByFiscalYearDescName(String status);
    List<Budget> findByIsActiveOrderByFiscalYearDescName(Boolean isActive);
    Optional<Budget> findByFiscalYearAndIsActive(Integer fiscalYear, Boolean isActive);
}
