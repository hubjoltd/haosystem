package com.erp.repository;

import com.erp.model.StatutoryRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface StatutoryRuleRepository extends JpaRepository<StatutoryRule, Long> {
    
    Optional<StatutoryRule> findByCode(String code);
    
    List<StatutoryRule> findByIsActiveTrue();
    
    List<StatutoryRule> findByRuleType(String ruleType);
    
    List<StatutoryRule> findByApplicableYear(Integer year);
    
    List<StatutoryRule> findByStateCode(String stateCode);
    
    @Query("SELECT s FROM StatutoryRule s WHERE s.isActive = true AND (s.effectiveFrom IS NULL OR s.effectiveFrom <= :date) AND (s.effectiveTo IS NULL OR s.effectiveTo >= :date)")
    List<StatutoryRule> findActiveRulesForDate(@Param("date") LocalDate date);
}
