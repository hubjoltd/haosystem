package com.erp.repository;

import com.erp.model.ChartOfAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ChartOfAccountRepository extends JpaRepository<ChartOfAccount, Long> {
    Optional<ChartOfAccount> findByAccountCode(String accountCode);
    List<ChartOfAccount> findByAccountTypeOrderByAccountCode(String accountType);
    List<ChartOfAccount> findByStatusOrderByAccountCode(String status);
    List<ChartOfAccount> findByParentIsNullOrderByAccountCode();
    List<ChartOfAccount> findByParentIdOrderByAccountCode(Long parentId);
    List<ChartOfAccount> findByCategoryIdOrderByAccountCode(Long categoryId);
    
    @Query("SELECT c FROM ChartOfAccount c WHERE c.accountType IN :types ORDER BY c.accountCode")
    List<ChartOfAccount> findByAccountTypeIn(@Param("types") List<String> types);
    
    @Query("SELECT c FROM ChartOfAccount c WHERE c.isHeader = false ORDER BY c.accountCode")
    List<ChartOfAccount> findAllPostableAccounts();
    
    @Query("SELECT SUM(c.currentBalance) FROM ChartOfAccount c WHERE c.accountType = :type")
    java.math.BigDecimal sumBalanceByAccountType(@Param("type") String type);
}
