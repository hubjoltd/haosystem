package com.erp.repository;

import com.erp.model.Designation;
import com.erp.model.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DesignationRepository extends JpaRepository<Designation, Long> {
    Optional<Designation> findByCode(String code);
    Optional<Designation> findByTitle(String title);
    List<Designation> findByActiveTrue();
    List<Designation> findByGrade(Grade grade);
}
