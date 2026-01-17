package com.erp.repository;

import com.erp.model.BudgetLine;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BudgetLineRepository extends JpaRepository<BudgetLine, Long> {
    List<BudgetLine> findByBudgetId(Long budgetId);
    List<BudgetLine> findByAccountId(Long accountId);
    List<BudgetLine> findByBudgetIdAndAccountId(Long budgetId, Long accountId);
}
