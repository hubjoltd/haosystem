package com.erp.repository;

import com.erp.model.AttendanceRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRuleRepository extends JpaRepository<AttendanceRule, Long> {
    
    Optional<AttendanceRule> findByRuleName(String ruleName);
    
    List<AttendanceRule> findByIsActiveTrue();
    
    Optional<AttendanceRule> findByIsDefaultTrue();
}
