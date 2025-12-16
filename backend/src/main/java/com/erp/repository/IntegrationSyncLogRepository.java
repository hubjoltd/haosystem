package com.erp.repository;

import com.erp.model.IntegrationSyncLog;
import com.erp.model.IntegrationConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface IntegrationSyncLogRepository extends JpaRepository<IntegrationSyncLog, Long> {
    List<IntegrationSyncLog> findByIntegrationOrderByStartedAtDesc(IntegrationConfig integration);
    Page<IntegrationSyncLog> findByIntegrationOrderByStartedAtDesc(IntegrationConfig integration, Pageable pageable);
    List<IntegrationSyncLog> findByStatus(String status);
    List<IntegrationSyncLog> findByStartedAtBetween(LocalDateTime start, LocalDateTime end);
    List<IntegrationSyncLog> findTop10ByIntegrationOrderByStartedAtDesc(IntegrationConfig integration);
}
