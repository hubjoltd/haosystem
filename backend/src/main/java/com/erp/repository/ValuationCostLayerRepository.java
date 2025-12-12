package com.erp.repository;

import com.erp.model.ValuationCostLayer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ValuationCostLayerRepository extends JpaRepository<ValuationCostLayer, Long> {
    List<ValuationCostLayer> findByItemIdOrderByCreatedAtAsc(Long itemId);
    List<ValuationCostLayer> findByItemIdAndWarehouseIdOrderByCreatedAtAsc(Long itemId, Long warehouseId);
    List<ValuationCostLayer> findByQuantityRemainingGreaterThanOrderByCreatedAtAsc(Integer quantity);
}
