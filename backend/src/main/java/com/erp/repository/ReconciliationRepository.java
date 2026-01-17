package com.erp.repository;

import com.erp.model.Reconciliation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ReconciliationRepository extends JpaRepository<Reconciliation, Long> {
    List<Reconciliation> findByBankAccountIdOrderByStatementDateDesc(Long bankAccountId);
    Optional<Reconciliation> findByBankAccountIdAndStatusNot(Long bankAccountId, String status);
    List<Reconciliation> findByStatusOrderByStatementDateDesc(String status);
}
