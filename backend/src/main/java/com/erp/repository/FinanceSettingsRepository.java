package com.erp.repository;

import com.erp.model.FinanceSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FinanceSettingsRepository extends JpaRepository<FinanceSettings, Long> {
}
