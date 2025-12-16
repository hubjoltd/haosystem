package com.erp.repository;

import com.erp.model.TaxRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaxRuleRepository extends JpaRepository<TaxRule, Long> {
    
    Optional<TaxRule> findByCode(String code);
    
    List<TaxRule> findByIsActiveTrue();
    
    List<TaxRule> findByTaxType(String taxType);
    
    List<TaxRule> findByTaxTypeAndIsActiveTrue(String taxType);
    
    List<TaxRule> findByStateCode(String stateCode);
    
    List<TaxRule> findByTaxYear(Integer taxYear);
    
    @Query("SELECT t FROM TaxRule t WHERE t.isActive = true AND (t.effectiveFrom IS NULL OR t.effectiveFrom <= :date) AND (t.effectiveTo IS NULL OR t.effectiveTo >= :date)")
    List<TaxRule> findActiveRulesForDate(@Param("date") LocalDate date);
}
