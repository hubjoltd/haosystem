package com.erp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "integration_sync_logs")
public class IntegrationSyncLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "integration_id", nullable = false)
    private IntegrationConfig integration;
    
    @Column(nullable = false, length = 50)
    private String syncType;
    
    @Column(nullable = false, length = 20)
    private String status;
    
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    
    private Integer recordsProcessed;
    private Integer recordsSuccessful;
    private Integer recordsFailed;
    
    @Column(columnDefinition = "TEXT")
    private String errorDetails;
    
    @Column(columnDefinition = "TEXT")
    private String syncDetails;
    
    private String triggeredBy;
    
    public IntegrationSyncLog() {}
    
    @PrePersist
    protected void onCreate() {
        if (startedAt == null) {
            startedAt = LocalDateTime.now();
        }
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public IntegrationConfig getIntegration() { return integration; }
    public void setIntegration(IntegrationConfig integration) { this.integration = integration; }
    public String getSyncType() { return syncType; }
    public void setSyncType(String syncType) { this.syncType = syncType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    public Integer getRecordsProcessed() { return recordsProcessed; }
    public void setRecordsProcessed(Integer recordsProcessed) { this.recordsProcessed = recordsProcessed; }
    public Integer getRecordsSuccessful() { return recordsSuccessful; }
    public void setRecordsSuccessful(Integer recordsSuccessful) { this.recordsSuccessful = recordsSuccessful; }
    public Integer getRecordsFailed() { return recordsFailed; }
    public void setRecordsFailed(Integer recordsFailed) { this.recordsFailed = recordsFailed; }
    public String getErrorDetails() { return errorDetails; }
    public void setErrorDetails(String errorDetails) { this.errorDetails = errorDetails; }
    public String getSyncDetails() { return syncDetails; }
    public void setSyncDetails(String syncDetails) { this.syncDetails = syncDetails; }
    public String getTriggeredBy() { return triggeredBy; }
    public void setTriggeredBy(String triggeredBy) { this.triggeredBy = triggeredBy; }
}
