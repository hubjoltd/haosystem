package com.erp.repository;

import com.erp.model.IntegrationConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface IntegrationConfigRepository extends JpaRepository<IntegrationConfig, Long> {
    List<IntegrationConfig> findByIntegrationType(String integrationType);
    List<IntegrationConfig> findByActive(Boolean active);
    List<IntegrationConfig> findByIntegrationTypeAndActive(String integrationType, Boolean active);
    Optional<IntegrationConfig> findByIntegrationTypeAndName(String integrationType, String name);
    List<IntegrationConfig> findBySyncEnabled(Boolean syncEnabled);
}
