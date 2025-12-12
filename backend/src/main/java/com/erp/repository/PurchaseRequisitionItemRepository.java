package com.erp.repository;

import com.erp.model.PurchaseRequisitionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseRequisitionItemRepository extends JpaRepository<PurchaseRequisitionItem, Long> {
    List<PurchaseRequisitionItem> findByPurchaseRequisitionId(Long prId);
}
