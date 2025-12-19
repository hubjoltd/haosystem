package com.erp.repository;

import com.erp.model.SalaryBand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SalaryBandRepository extends JpaRepository<SalaryBand, Long> {
    Optional<SalaryBand> findByBandCode(String bandCode);
    
    List<SalaryBand> findByGradeId(Long gradeId);
    
    List<SalaryBand> findByIsActiveTrue();
    
    @Query("SELECT sb FROM SalaryBand sb WHERE sb.grade.id = :gradeId AND sb.isActive = true")
    List<SalaryBand> findActiveByGrade(@Param("gradeId") Long gradeId);
    
    @Query("SELECT sb FROM SalaryBand sb WHERE sb.isActive = true ORDER BY sb.grade.level, sb.minSalary")
    List<SalaryBand> findAllActiveOrderedByGrade();
}
