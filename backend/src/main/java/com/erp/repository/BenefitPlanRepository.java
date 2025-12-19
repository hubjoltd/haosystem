package com.erp.repository;

import com.erp.model.BenefitPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BenefitPlanRepository extends JpaRepository<BenefitPlan, Long> {
    Optional<BenefitPlan> findByPlanCode(String planCode);
    
    List<BenefitPlan> findByBenefitType(String benefitType);
    
    List<BenefitPlan> findByIsActiveTrue();
    
    @Query("SELECT bp FROM BenefitPlan bp WHERE bp.isActive = true AND bp.effectiveFrom <= :date AND (bp.effectiveTo IS NULL OR bp.effectiveTo >= :date)")
    List<BenefitPlan> findActivePlansAsOfDate(@Param("date") LocalDate date);
    
    @Query("SELECT bp FROM BenefitPlan bp WHERE bp.benefitType = :type AND bp.isActive = true")
    List<BenefitPlan> findActiveByType(@Param("type") String type);
}
