package com.erp.repository;

import com.erp.model.BankTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface BankTransactionRepository extends JpaRepository<BankTransaction, Long> {
    List<BankTransaction> findByBankAccountIdOrderByTransactionDateDesc(Long bankAccountId);
    List<BankTransaction> findByBankAccountIdAndStatusOrderByTransactionDateDesc(Long bankAccountId, String status);
    List<BankTransaction> findByBankAccountIdAndTransactionDateBetweenOrderByTransactionDateDesc(Long bankAccountId, LocalDate startDate, LocalDate endDate);
    List<BankTransaction> findByStatusOrderByTransactionDateDesc(String status);
    List<BankTransaction> findByIsReconciledOrderByTransactionDateDesc(Boolean isReconciled);
    
    @Query("SELECT SUM(t.amount) FROM BankTransaction t WHERE t.bankAccount.id = :bankAccountId AND t.transactionType = 'Deposit' AND t.status = 'Confirmed'")
    BigDecimal sumDepositsByBankAccountId(@Param("bankAccountId") Long bankAccountId);
    
    @Query("SELECT SUM(t.amount) FROM BankTransaction t WHERE t.bankAccount.id = :bankAccountId AND t.transactionType = 'Withdrawal' AND t.status = 'Confirmed'")
    BigDecimal sumWithdrawalsByBankAccountId(@Param("bankAccountId") Long bankAccountId);
    
    @Query("SELECT t FROM BankTransaction t WHERE t.bankAccount.id = :bankAccountId AND t.matched = false ORDER BY t.transactionDate DESC")
    List<BankTransaction> findUnmatchedTransactions(@Param("bankAccountId") Long bankAccountId);
}
