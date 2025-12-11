package com.erp.repository;

import com.erp.model.InventoryLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventoryLedgerRepository extends JpaRepository<InventoryLedger, Long> {
    List<InventoryLedger> findByItemId(Long itemId);
    List<InventoryLedger> findByWarehouseId(Long warehouseId);
    List<InventoryLedger> findByTransactionDateBetween(LocalDateTime start, LocalDateTime end);
    List<InventoryLedger> findByItemIdAndTransactionDateBetween(Long itemId, LocalDateTime start, LocalDateTime end);
}
