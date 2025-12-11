package com.erp.repository;

import com.erp.model.GeneralSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GeneralSettingsRepository extends JpaRepository<GeneralSettings, Long> {
}
