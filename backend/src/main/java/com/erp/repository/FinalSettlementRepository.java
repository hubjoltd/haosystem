package com.erp.repository;

import com.erp.model.FinalSettlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FinalSettlementRepository extends JpaRepository<FinalSettlement, Long> {
    Optional<FinalSettlement> findBySettlementNumber(String settlementNumber);
    Optional<FinalSettlement> findByEmployeeId(Long employeeId);
    List<FinalSettlement> findByStatus(String status);
    List<FinalSettlement> findByStatusOrderByCreatedAtDesc(String status);
    List<FinalSettlement> findAllByOrderByCreatedAtDesc();
    boolean existsByEmployeeId(Long employeeId);
}
