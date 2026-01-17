package com.erp.repository;

import com.erp.model.AccountCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AccountCategoryRepository extends JpaRepository<AccountCategory, Long> {
    List<AccountCategory> findByAccountTypeOrderByDisplayOrder(String accountType);
    List<AccountCategory> findAllByOrderByDisplayOrder();
}
