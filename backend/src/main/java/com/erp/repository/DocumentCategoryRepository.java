package com.erp.repository;

import com.erp.model.DocumentCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentCategoryRepository extends JpaRepository<DocumentCategory, Long> {
    List<DocumentCategory> findByActiveTrueOrderBySortOrderAsc();
    Optional<DocumentCategory> findByCode(String code);
}
