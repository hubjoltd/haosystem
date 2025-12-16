package com.erp.repository;

import com.erp.model.OvertimeRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OvertimeRuleRepository extends JpaRepository<OvertimeRule, Long> {
    
    Optional<OvertimeRule> findByCode(String code);
    
    List<OvertimeRule> findByIsActiveTrue();
    
    List<OvertimeRule> findByRuleType(String ruleType);
    
    List<OvertimeRule> findByIsActiveTrueOrderByPriorityAsc();
}
