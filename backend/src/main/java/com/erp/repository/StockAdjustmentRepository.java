package com.erp.repository;

import com.erp.model.StockAdjustment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface StockAdjustmentRepository extends JpaRepository<StockAdjustment, Long> {
    List<StockAdjustment> findByAdjustmentDateBetween(LocalDate start, LocalDate end);
    List<StockAdjustment> findByItemId(Long itemId);
}
