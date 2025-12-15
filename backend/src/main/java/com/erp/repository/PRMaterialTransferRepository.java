package com.erp.repository;

import com.erp.model.PRMaterialTransfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PRMaterialTransferRepository extends JpaRepository<PRMaterialTransfer, Long> {
    
    List<PRMaterialTransfer> findByPurchaseRequisitionId(Long prId);
    
    @Query("SELECT t FROM PRMaterialTransfer t WHERE t.prNumber = :prNumber")
    List<PRMaterialTransfer> findByPrNumber(@Param("prNumber") String prNumber);
    
    @Query("SELECT t FROM PRMaterialTransfer t LEFT JOIN FETCH t.items WHERE t.purchaseRequisition.id = :prId")
    List<PRMaterialTransfer> findByPrIdWithItems(@Param("prId") Long prId);
    
    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(t.transferNumber, 4) AS integer)), 0) FROM PRMaterialTransfer t WHERE t.transferNumber LIKE :prefix%")
    Integer findMaxNumberByPrefix(@Param("prefix") String prefix);
}
