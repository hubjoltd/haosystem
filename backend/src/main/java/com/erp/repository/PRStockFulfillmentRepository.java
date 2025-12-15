package com.erp.repository;

import com.erp.model.PRStockFulfillment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PRStockFulfillmentRepository extends JpaRepository<PRStockFulfillment, Long> {
    
    List<PRStockFulfillment> findByPurchaseRequisitionId(Long prId);
    
    @Query("SELECT f FROM PRStockFulfillment f WHERE f.prNumber = :prNumber")
    List<PRStockFulfillment> findByPrNumber(@Param("prNumber") String prNumber);
    
    @Query("SELECT f FROM PRStockFulfillment f LEFT JOIN FETCH f.items WHERE f.purchaseRequisition.id = :prId")
    List<PRStockFulfillment> findByPrIdWithItems(@Param("prId") Long prId);
    
    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(f.fulfillmentNumber, 4) AS integer)), 0) FROM PRStockFulfillment f WHERE f.fulfillmentNumber LIKE :prefix%")
    Integer findMaxNumberByPrefix(@Param("prefix") String prefix);
}
