package com.erp.repository;

import com.erp.model.StockTransferLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StockTransferLineRepository extends JpaRepository<StockTransferLine, Long> {
    List<StockTransferLine> findByStockTransferId(Long stockTransferId);
}
