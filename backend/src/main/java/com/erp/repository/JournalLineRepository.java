package com.erp.repository;

import com.erp.model.JournalLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface JournalLineRepository extends JpaRepository<JournalLine, Long> {
    List<JournalLine> findByJournalEntryIdOrderByLineNumber(Long journalEntryId);
    List<JournalLine> findByAccountIdOrderByJournalEntryEntryDateDesc(Long accountId);
    
    @Query("SELECT SUM(jl.debitAmount) FROM JournalLine jl WHERE jl.account.id = :accountId AND jl.journalEntry.status = 'Posted'")
    BigDecimal sumDebitsByAccountId(@Param("accountId") Long accountId);
    
    @Query("SELECT SUM(jl.creditAmount) FROM JournalLine jl WHERE jl.account.id = :accountId AND jl.journalEntry.status = 'Posted'")
    BigDecimal sumCreditsByAccountId(@Param("accountId") Long accountId);
    
    @Query("SELECT jl FROM JournalLine jl WHERE jl.account.id = :accountId AND jl.journalEntry.entryDate BETWEEN :startDate AND :endDate ORDER BY jl.journalEntry.entryDate")
    List<JournalLine> findByAccountIdAndDateRange(@Param("accountId") Long accountId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT jl FROM JournalLine jl WHERE jl.customerId = :customerId AND jl.journalEntry.entryDate BETWEEN :startDate AND :endDate ORDER BY jl.journalEntry.entryDate DESC")
    List<JournalLine> findByCustomerIdAndDateRange(@Param("customerId") Long customerId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT jl FROM JournalLine jl WHERE jl.customerId = :customerId AND jl.account.accountType = 'ASSET' AND jl.debitAmount > 0 AND jl.journalEntry.status = 'Posted' ORDER BY jl.journalEntry.entryDate DESC")
    List<JournalLine> findUnpaidReceivablesByCustomer(@Param("customerId") Long customerId);
    
    @Query("SELECT jl FROM JournalLine jl WHERE jl.account.accountType = 'ASSET' AND jl.debitAmount > 0 AND jl.journalEntry.status = 'Posted' ORDER BY jl.journalEntry.entryDate DESC")
    List<JournalLine> findAllUnpaidReceivables();
}
