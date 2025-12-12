package com.erp.repository;

import com.erp.model.PrefixSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrefixSettingsRepository extends JpaRepository<PrefixSettings, Long> {
}
