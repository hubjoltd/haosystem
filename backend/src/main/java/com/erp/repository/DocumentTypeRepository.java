package com.erp.repository;

import com.erp.model.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentTypeRepository extends JpaRepository<DocumentType, Long> {
    List<DocumentType> findByActiveTrueOrderBySortOrderAsc();
    List<DocumentType> findByCategoryIdAndActiveTrueOrderBySortOrderAsc(Long categoryId);
    List<DocumentType> findByIsMandatoryTrue();
    Optional<DocumentType> findByCode(String code);
}
