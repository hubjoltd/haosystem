package com.erp.repository;

import com.erp.model.ValuationCostLayer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ValuationCostLayerRepository extends JpaRepository<ValuationCostLayer, Long> {
    // FIFO queries (oldest first)
    List<ValuationCostLayer> findByItemIdOrderByCreatedAtAsc(Long itemId);
    List<ValuationCostLayer> findByItemIdAndWarehouseIdOrderByCreatedAtAsc(Long itemId, Long warehouseId);
    List<ValuationCostLayer> findByItemIdAndQuantityRemainingGreaterThanOrderByCreatedAtAsc(Long itemId, Integer quantity);
    List<ValuationCostLayer> findByItemIdAndWarehouseIdAndQuantityRemainingGreaterThanOrderByCreatedAtAsc(Long itemId, Long warehouseId, Integer quantity);
    
    // LIFO queries (newest first)
    List<ValuationCostLayer> findByItemIdOrderByCreatedAtDesc(Long itemId);
    List<ValuationCostLayer> findByItemIdAndWarehouseIdOrderByCreatedAtDesc(Long itemId, Long warehouseId);
    List<ValuationCostLayer> findByItemIdAndQuantityRemainingGreaterThanOrderByCreatedAtDesc(Long itemId, Integer quantity);
    List<ValuationCostLayer> findByItemIdAndWarehouseIdAndQuantityRemainingGreaterThanOrderByCreatedAtDesc(Long itemId, Long warehouseId, Integer quantity);
    
    // Weighted average queries
    @Query("SELECT SUM(v.quantityRemaining) FROM ValuationCostLayer v WHERE v.item.id = :itemId AND v.quantityRemaining > 0")
    Integer getTotalQuantityByItemId(@Param("itemId") Long itemId);
    
    @Query("SELECT SUM(v.quantityRemaining * v.unitCost) FROM ValuationCostLayer v WHERE v.item.id = :itemId AND v.quantityRemaining > 0")
    BigDecimal getTotalValueByItemId(@Param("itemId") Long itemId);
    
    @Query("SELECT SUM(v.quantityRemaining) FROM ValuationCostLayer v WHERE v.item.id = :itemId AND v.warehouse.id = :warehouseId AND v.quantityRemaining > 0")
    Integer getTotalQuantityByItemIdAndWarehouseId(@Param("itemId") Long itemId, @Param("warehouseId") Long warehouseId);
    
    @Query("SELECT SUM(v.quantityRemaining * v.unitCost) FROM ValuationCostLayer v WHERE v.item.id = :itemId AND v.warehouse.id = :warehouseId AND v.quantityRemaining > 0")
    BigDecimal getTotalValueByItemIdAndWarehouseId(@Param("itemId") Long itemId, @Param("warehouseId") Long warehouseId);
}
