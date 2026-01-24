package com.erp.repository;

import com.erp.model.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BranchRepository extends JpaRepository<Branch, Long> {
    Optional<Branch> findByCode(String code);
    Optional<Branch> findByName(String name);
    Optional<Branch> findBySlug(String slug);
    List<Branch> findByActiveTrue();
    boolean existsByCode(String code);
    boolean existsBySlug(String slug);
}
