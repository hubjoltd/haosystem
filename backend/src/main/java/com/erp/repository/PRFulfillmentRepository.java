package com.erp.repository;

import com.erp.model.PRFulfillment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PRFulfillmentRepository extends JpaRepository<PRFulfillment, Long> {
    List<PRFulfillment> findByPrId(Long prId);
    List<PRFulfillment> findByFulfillmentType(String fulfillmentType);
    List<PRFulfillment> findAllByOrderByCreatedAtDesc();
    
    @Query("SELECT DISTINCT pf FROM PRFulfillment pf LEFT JOIN FETCH pf.items WHERE pf.fulfillmentType = 'PO' ORDER BY pf.createdAt DESC")
    List<PRFulfillment> findAllPOsWithItems();
    
    @Query("SELECT pf FROM PRFulfillment pf LEFT JOIN FETCH pf.items WHERE pf.id = :id")
    Optional<PRFulfillment> findByIdWithItems(Long id);
}
