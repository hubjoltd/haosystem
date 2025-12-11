package com.erp.repository;

import com.erp.model.Bin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BinRepository extends JpaRepository<Bin, Long> {
    List<Bin> findByWarehouseId(Long warehouseId);
    List<Bin> findByStatus(String status);
    Optional<Bin> findByCodeAndWarehouseId(String code, Long warehouseId);
    boolean existsByCodeAndWarehouseId(String code, Long warehouseId);
}
