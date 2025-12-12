package com.erp.repository;

import com.erp.model.PurchaseRequisition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseRequisitionRepository extends JpaRepository<PurchaseRequisition, Long> {
    Optional<PurchaseRequisition> findByPrNumber(String prNumber);
    List<PurchaseRequisition> findByStatus(String status);
    List<PurchaseRequisition> findByRequestedById(Long requestedById);
    List<PurchaseRequisition> findByDepartment(String department);
    List<PurchaseRequisition> findAllByOrderByCreatedAtDesc();
}
