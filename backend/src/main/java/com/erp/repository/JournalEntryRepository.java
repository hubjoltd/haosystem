package com.erp.repository;

import com.erp.model.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface JournalEntryRepository extends JpaRepository<JournalEntry, Long> {
    Optional<JournalEntry> findByEntryNumber(String entryNumber);
    List<JournalEntry> findByStatusOrderByEntryDateDesc(String status);
    List<JournalEntry> findByEntryDateBetweenOrderByEntryDateDesc(LocalDate startDate, LocalDate endDate);
    List<JournalEntry> findByReferenceTypeAndReferenceId(String referenceType, Long referenceId);
    
    @Query("SELECT j FROM JournalEntry j WHERE j.fiscalPeriod.id = :periodId ORDER BY j.entryDate DESC")
    List<JournalEntry> findByFiscalPeriod(@Param("periodId") Long periodId);
    
    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(j.entryNumber, 4) AS integer)), 0) FROM JournalEntry j WHERE j.entryNumber LIKE 'JE-%'")
    Integer findMaxEntryNumber();
}
