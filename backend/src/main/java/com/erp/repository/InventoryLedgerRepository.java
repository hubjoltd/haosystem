package com.erp.repository;

import com.erp.model.InventoryLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventoryLedgerRepository extends JpaRepository<InventoryLedger, Long> {
    List<InventoryLedger> findAllByOrderByTransactionDateDesc();
    List<InventoryLedger> findByItemIdOrderByTransactionDateDesc(Long itemId);
    List<InventoryLedger> findByWarehouseIdOrderByTransactionDateDesc(Long warehouseId);
    List<InventoryLedger> findByTransactionDateBetweenOrderByTransactionDateDesc(LocalDateTime start, LocalDateTime end);
    List<InventoryLedger> findByItemIdAndTransactionDateBetweenOrderByTransactionDateDesc(Long itemId, LocalDateTime start, LocalDateTime end);
    List<InventoryLedger> findByItemIdAndWarehouseIdOrderByTransactionDateDesc(Long itemId, Long warehouseId);
    
    @Query("SELECT l FROM InventoryLedger l WHERE " +
           "(:itemId IS NULL OR l.item.id = :itemId) AND " +
           "(:warehouseId IS NULL OR l.warehouse.id = :warehouseId) AND " +
           "(:startDate IS NULL OR l.transactionDate >= :startDate) AND " +
           "(:endDate IS NULL OR l.transactionDate <= :endDate) " +
           "ORDER BY l.transactionDate DESC")
    List<InventoryLedger> findWithFilters(
        @Param("itemId") Long itemId,
        @Param("warehouseId") Long warehouseId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
}
