package com.erp.repository;

import com.erp.model.BankAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {
    List<BankAccount> findByIsActiveOrderByAccountName(Boolean isActive);
    Optional<BankAccount> findByIsPrimary(Boolean isPrimary);
    Optional<BankAccount> findByAccountNumber(String accountNumber);
    
    @Query("SELECT SUM(b.currentBalance) FROM BankAccount b WHERE b.isActive = true")
    java.math.BigDecimal sumTotalBalance();
}
