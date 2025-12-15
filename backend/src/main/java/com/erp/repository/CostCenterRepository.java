package com.erp.repository;

import com.erp.model.CostCenter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CostCenterRepository extends JpaRepository<CostCenter, Long> {
    Optional<CostCenter> findByCode(String code);
    Optional<CostCenter> findByName(String name);
    List<CostCenter> findByActiveTrue();
    List<CostCenter> findByParentIsNull();
}
