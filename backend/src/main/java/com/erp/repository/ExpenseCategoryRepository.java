package com.erp.repository;

import com.erp.model.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseCategoryRepository extends JpaRepository<ExpenseCategory, Long> {
    Optional<ExpenseCategory> findByCode(String code);
    List<ExpenseCategory> findByActive(Boolean active);
    List<ExpenseCategory> findByExpenseType(String expenseType);
    List<ExpenseCategory> findByParentIsNull();
    List<ExpenseCategory> findByParent(ExpenseCategory parent);
    List<ExpenseCategory> findByActiveOrderByDisplayOrderAsc(Boolean active);
    boolean existsByCode(String code);
}
