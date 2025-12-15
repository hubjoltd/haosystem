package com.erp.repository;

import com.erp.model.ExpenseCenter;
import com.erp.model.CostCenter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseCenterRepository extends JpaRepository<ExpenseCenter, Long> {
    Optional<ExpenseCenter> findByCode(String code);
    Optional<ExpenseCenter> findByName(String name);
    List<ExpenseCenter> findByActiveTrue();
    List<ExpenseCenter> findByCostCenter(CostCenter costCenter);
}
