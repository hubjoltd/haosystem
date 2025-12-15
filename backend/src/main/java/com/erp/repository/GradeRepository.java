package com.erp.repository;

import com.erp.model.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {
    Optional<Grade> findByCode(String code);
    Optional<Grade> findByName(String name);
    List<Grade> findByActiveTrue();
    List<Grade> findByActiveTrueOrderByLevelAsc();
}
