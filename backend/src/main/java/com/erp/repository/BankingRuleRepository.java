package com.erp.repository;

import com.erp.model.BankingRule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BankingRuleRepository extends JpaRepository<BankingRule, Long> {
    List<BankingRule> findByIsActiveOrderByPriorityDesc(Boolean isActive);
    List<BankingRule> findByBankAccountIdAndIsActiveOrderByPriorityDesc(Long bankAccountId, Boolean isActive);
    List<BankingRule> findByApplyToAllAccountsAndIsActiveOrderByPriorityDesc(Boolean applyToAll, Boolean isActive);
}
