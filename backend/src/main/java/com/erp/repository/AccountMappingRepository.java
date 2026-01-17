package com.erp.repository;

import com.erp.model.AccountMapping;
import com.erp.model.MappingType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountMappingRepository extends JpaRepository<AccountMapping, Long> {
    List<AccountMapping> findByMappingTypeOrderByDisplayOrder(MappingType mappingType);
    List<AccountMapping> findByMappingTypeAndActiveTrue(MappingType mappingType);
    List<AccountMapping> findByBranchIdAndMappingTypeOrderByDisplayOrder(Long branchId, MappingType mappingType);
    Optional<AccountMapping> findByMappingTypeAndMappingKey(MappingType mappingType, String mappingKey);
    Optional<AccountMapping> findByBranchIdAndMappingTypeAndMappingKey(Long branchId, MappingType mappingType, String mappingKey);
    boolean existsByMappingTypeAndMappingKey(MappingType mappingType, String mappingKey);
}
