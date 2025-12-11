package com.erp.repository;

import com.erp.model.GoodsReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface GoodsReceiptRepository extends JpaRepository<GoodsReceipt, Long> {
    List<GoodsReceipt> findByReceiptDateBetween(LocalDate start, LocalDate end);
    List<GoodsReceipt> findBySupplierId(Long supplierId);
}
