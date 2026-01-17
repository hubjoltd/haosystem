package com.erp.repository;

import com.erp.model.AccountTransfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AccountTransferRepository extends JpaRepository<AccountTransfer, Long> {
    Optional<AccountTransfer> findByTransferNumber(String transferNumber);
    List<AccountTransfer> findByTransferDateBetweenOrderByTransferDateDesc(LocalDate startDate, LocalDate endDate);
    List<AccountTransfer> findByFromAccountIdOrToAccountIdOrderByTransferDateDesc(Long fromAccountId, Long toAccountId);
    
    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(t.transferNumber, 5) AS integer)), 0) FROM AccountTransfer t WHERE t.transferNumber LIKE 'TRF-%'")
    Integer findMaxTransferNumber();
}
