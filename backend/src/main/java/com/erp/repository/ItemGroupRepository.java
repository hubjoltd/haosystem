package com.erp.repository;

import com.erp.model.ItemGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ItemGroupRepository extends JpaRepository<ItemGroup, Long> {
    Optional<ItemGroup> findByCode(String code);
    Optional<ItemGroup> findByName(String name);
    List<ItemGroup> findByStatus(String status);
    boolean existsByCode(String code);
    boolean existsByName(String name);
}
