package com.erp.repository;

import com.erp.model.UnitOfMeasure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UnitOfMeasureRepository extends JpaRepository<UnitOfMeasure, Long> {
    Optional<UnitOfMeasure> findByCode(String code);
    List<UnitOfMeasure> findByStatus(String status);
    List<UnitOfMeasure> findByBaseUomIsNull();
    List<UnitOfMeasure> findByBaseUomId(Long baseUomId);
    boolean existsByCode(String code);
}
