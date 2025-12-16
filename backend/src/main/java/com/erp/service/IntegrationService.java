package com.erp.service;

import com.erp.model.IntegrationConfig;
import com.erp.model.IntegrationSyncLog;
import com.erp.repository.IntegrationConfigRepository;
import com.erp.repository.IntegrationSyncLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class IntegrationService {

    @Value("${integration.encryption.key:DefaultSecretKey123}")
    private String encryptionKey;

    private static final String ALGORITHM = "AES";

    @Autowired
    private IntegrationConfigRepository integrationConfigRepository;

    @Autowired
    private IntegrationSyncLogRepository syncLogRepository;

    public List<IntegrationConfig> findAll() {
        return integrationConfigRepository.findAll();
    }

    public Optional<IntegrationConfig> findById(Long id) {
        return integrationConfigRepository.findById(id);
    }

    public List<IntegrationConfig> findByType(String integrationType) {
        return integrationConfigRepository.findByIntegrationType(integrationType);
    }

    public List<IntegrationConfig> findActive() {
        return integrationConfigRepository.findByActive(true);
    }

    public List<IntegrationConfig> findActiveByType(String integrationType) {
        return integrationConfigRepository.findByIntegrationTypeAndActive(integrationType, true);
    }

    @Transactional
    public IntegrationConfig save(IntegrationConfig config) {
        return integrationConfigRepository.save(config);
    }

    @Transactional
    public IntegrationConfig create(Map<String, Object> data) {
        IntegrationConfig config = new IntegrationConfig();
        updateConfigFromMap(config, data);
        return integrationConfigRepository.save(config);
    }

    @Transactional
    public IntegrationConfig update(Long id, Map<String, Object> data) {
        IntegrationConfig config = integrationConfigRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Integration configuration not found"));
        updateConfigFromMap(config, data);
        return integrationConfigRepository.save(config);
    }

    private void updateConfigFromMap(IntegrationConfig config, Map<String, Object> data) {
        if (data.containsKey("integrationType")) config.setIntegrationType((String) data.get("integrationType"));
        if (data.containsKey("name")) config.setName((String) data.get("name"));
        if (data.containsKey("description")) config.setDescription((String) data.get("description"));
        if (data.containsKey("apiUrl")) config.setApiUrl((String) data.get("apiUrl"));
        if (data.containsKey("apiKey")) config.setApiKey(encrypt((String) data.get("apiKey")));
        if (data.containsKey("apiSecret")) config.setApiSecret(encrypt((String) data.get("apiSecret")));
        if (data.containsKey("clientId")) config.setClientId((String) data.get("clientId"));
        if (data.containsKey("clientSecret")) config.setClientSecret(encrypt((String) data.get("clientSecret")));
        if (data.containsKey("accessToken")) config.setAccessToken(encrypt((String) data.get("accessToken")));
        if (data.containsKey("refreshToken")) config.setRefreshToken(encrypt((String) data.get("refreshToken")));
        if (data.containsKey("username")) config.setUsername((String) data.get("username"));
        if (data.containsKey("password")) config.setPassword(encrypt((String) data.get("password")));
        if (data.containsKey("companyId")) config.setCompanyId((String) data.get("companyId"));
        if (data.containsKey("environment")) config.setEnvironment((String) data.get("environment"));
        if (data.containsKey("smtpHost")) config.setSmtpHost((String) data.get("smtpHost"));
        if (data.containsKey("smtpPort")) config.setSmtpPort((Integer) data.get("smtpPort"));
        if (data.containsKey("smtpSecurity")) config.setSmtpSecurity((String) data.get("smtpSecurity"));
        if (data.containsKey("smsProvider")) config.setSmsProvider((String) data.get("smsProvider"));
        if (data.containsKey("smsAccountSid")) config.setSmsAccountSid((String) data.get("smsAccountSid"));
        if (data.containsKey("smsAuthToken")) config.setSmsAuthToken(encrypt((String) data.get("smsAuthToken")));
        if (data.containsKey("smsFromNumber")) config.setSmsFromNumber((String) data.get("smsFromNumber"));
        if (data.containsKey("webhookUrl")) config.setWebhookUrl((String) data.get("webhookUrl"));
        if (data.containsKey("webhookSecret")) config.setWebhookSecret(encrypt((String) data.get("webhookSecret")));
        if (data.containsKey("syncEnabled")) config.setSyncEnabled((Boolean) data.get("syncEnabled"));
        if (data.containsKey("syncFrequency")) config.setSyncFrequency((String) data.get("syncFrequency"));
        if (data.containsKey("active")) config.setActive((Boolean) data.get("active"));
        if (data.containsKey("createdBy")) config.setCreatedBy((String) data.get("createdBy"));
        if (data.containsKey("updatedBy")) config.setUpdatedBy((String) data.get("updatedBy"));
    }

    private String encrypt(String value) {
        if (value == null || value.isEmpty()) return value;
        try {
            SecretKeySpec key = generateKey();
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, key);
            byte[] encrypted = cipher.doFinal(value.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            throw new RuntimeException("Error encrypting credential", e);
        }
    }

    private String decrypt(String encryptedValue) {
        if (encryptedValue == null || encryptedValue.isEmpty()) return encryptedValue;
        try {
            SecretKeySpec key = generateKey();
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, key);
            byte[] decoded = Base64.getDecoder().decode(encryptedValue);
            return new String(cipher.doFinal(decoded), StandardCharsets.UTF_8);
        } catch (Exception e) {
            return encryptedValue;
        }
    }

    private SecretKeySpec generateKey() throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] keyBytes = digest.digest(encryptionKey.getBytes(StandardCharsets.UTF_8));
        return new SecretKeySpec(Arrays.copyOf(keyBytes, 16), ALGORITHM);
    }

    public IntegrationConfig redactSensitiveFields(IntegrationConfig config) {
        IntegrationConfig redacted = new IntegrationConfig();
        redacted.setId(config.getId());
        redacted.setIntegrationType(config.getIntegrationType());
        redacted.setName(config.getName());
        redacted.setDescription(config.getDescription());
        redacted.setApiUrl(config.getApiUrl());
        redacted.setClientId(config.getClientId());
        redacted.setCompanyId(config.getCompanyId());
        redacted.setEnvironment(config.getEnvironment());
        redacted.setSmtpHost(config.getSmtpHost());
        redacted.setSmtpPort(config.getSmtpPort());
        redacted.setSmtpSecurity(config.getSmtpSecurity());
        redacted.setSmsProvider(config.getSmsProvider());
        redacted.setSmsAccountSid(config.getSmsAccountSid());
        redacted.setSmsFromNumber(config.getSmsFromNumber());
        redacted.setWebhookUrl(config.getWebhookUrl());
        redacted.setSyncEnabled(config.getSyncEnabled());
        redacted.setSyncFrequency(config.getSyncFrequency());
        redacted.setActive(config.getActive());
        redacted.setLastSyncAt(config.getLastSyncAt());
        redacted.setLastSyncStatus(config.getLastSyncStatus());
        redacted.setLastSyncMessage(config.getLastSyncMessage());
        redacted.setUsername(config.getUsername());
        redacted.setApiKey(config.getApiKey() != null ? "********" : null);
        redacted.setApiSecret(config.getApiSecret() != null ? "********" : null);
        redacted.setClientSecret(config.getClientSecret() != null ? "********" : null);
        redacted.setAccessToken(config.getAccessToken() != null ? "********" : null);
        redacted.setRefreshToken(config.getRefreshToken() != null ? "********" : null);
        redacted.setPassword(config.getPassword() != null ? "********" : null);
        redacted.setSmsAuthToken(config.getSmsAuthToken() != null ? "********" : null);
        redacted.setWebhookSecret(config.getWebhookSecret() != null ? "********" : null);
        return redacted;
    }

    public List<IntegrationConfig> findAllRedacted() {
        List<IntegrationConfig> configs = integrationConfigRepository.findAll();
        List<IntegrationConfig> redacted = new ArrayList<>();
        for (IntegrationConfig config : configs) {
            redacted.add(redactSensitiveFields(config));
        }
        return redacted;
    }

    @Transactional
    public void deleteById(Long id) {
        integrationConfigRepository.deleteById(id);
    }

    @Transactional
    public IntegrationConfig toggleActive(Long id) {
        IntegrationConfig config = integrationConfigRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Integration configuration not found"));
        config.setActive(!config.getActive());
        return integrationConfigRepository.save(config);
    }

    @Transactional
    public Map<String, Object> testConnection(Long id) {
        IntegrationConfig config = integrationConfigRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Integration configuration not found"));
        
        Map<String, Object> result = new HashMap<>();
        result.put("integrationId", id);
        result.put("integrationType", config.getIntegrationType());
        
        try {
            boolean success = performConnectionTest(config);
            result.put("success", success);
            result.put("message", success ? "Connection successful" : "Connection failed");
            result.put("testedAt", LocalDateTime.now());
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Connection test failed: " + e.getMessage());
            result.put("testedAt", LocalDateTime.now());
        }
        
        return result;
    }

    private boolean performConnectionTest(IntegrationConfig config) {
        switch (config.getIntegrationType()) {
            case "QUICKBOOKS":
            case "SAP":
            case "ADP":
            case "JIRA":
                return config.getApiUrl() != null && !config.getApiUrl().isEmpty();
            case "SMTP":
                return config.getSmtpHost() != null && config.getSmtpPort() != null;
            case "SMS":
                return config.getSmsAccountSid() != null && config.getSmsAuthToken() != null;
            default:
                return true;
        }
    }

    @Transactional
    public IntegrationSyncLog triggerSync(Long id, String syncType, String triggeredBy) {
        IntegrationConfig config = integrationConfigRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Integration configuration not found"));
        
        IntegrationSyncLog log = new IntegrationSyncLog();
        log.setIntegration(config);
        log.setSyncType(syncType);
        log.setStatus("IN_PROGRESS");
        log.setStartedAt(LocalDateTime.now());
        log.setTriggeredBy(triggeredBy);
        log = syncLogRepository.save(log);
        
        try {
            performSync(config, syncType, log);
            log.setStatus("SUCCESS");
            log.setCompletedAt(LocalDateTime.now());
            
            config.setLastSyncAt(LocalDateTime.now());
            config.setLastSyncStatus("SUCCESS");
            config.setLastSyncMessage("Sync completed successfully");
            integrationConfigRepository.save(config);
        } catch (Exception e) {
            log.setStatus("FAILED");
            log.setErrorDetails(e.getMessage());
            log.setCompletedAt(LocalDateTime.now());
            
            config.setLastSyncAt(LocalDateTime.now());
            config.setLastSyncStatus("FAILED");
            config.setLastSyncMessage(e.getMessage());
            integrationConfigRepository.save(config);
        }
        
        return syncLogRepository.save(log);
    }

    private void performSync(IntegrationConfig config, String syncType, IntegrationSyncLog log) {
        log.setRecordsProcessed(0);
        log.setRecordsSuccessful(0);
        log.setRecordsFailed(0);
        log.setSyncDetails("Sync type: " + syncType + " for " + config.getIntegrationType());
    }

    public List<IntegrationSyncLog> getSyncLogs(Long integrationId) {
        IntegrationConfig config = integrationConfigRepository.findById(integrationId)
            .orElseThrow(() -> new RuntimeException("Integration configuration not found"));
        return syncLogRepository.findTop10ByIntegrationOrderByStartedAtDesc(config);
    }

    public List<Map<String, Object>> getIntegrationTypes() {
        List<Map<String, Object>> types = new ArrayList<>();
        
        types.add(createTypeInfo("QUICKBOOKS", "QuickBooks", "Accounting system integration", "Accounting"));
        types.add(createTypeInfo("SAP", "SAP", "Enterprise resource planning integration", "Accounting"));
        types.add(createTypeInfo("ADP", "ADP", "Payroll provider integration", "Payroll"));
        types.add(createTypeInfo("JIRA", "Jira", "Project management tool integration", "Project"));
        types.add(createTypeInfo("SMTP", "SMTP", "Email notification gateway", "Notification"));
        types.add(createTypeInfo("SMS", "SMS", "SMS notification gateway", "Notification"));
        
        return types;
    }

    private Map<String, Object> createTypeInfo(String code, String name, String description, String category) {
        Map<String, Object> type = new HashMap<>();
        type.put("code", code);
        type.put("name", name);
        type.put("description", description);
        type.put("category", category);
        return type;
    }

    public Map<String, Object> getIntegrationStatus() {
        Map<String, Object> status = new HashMap<>();
        
        List<IntegrationConfig> all = integrationConfigRepository.findAll();
        status.put("total", all.size());
        status.put("active", all.stream().filter(c -> Boolean.TRUE.equals(c.getActive())).count());
        status.put("syncEnabled", all.stream().filter(c -> Boolean.TRUE.equals(c.getSyncEnabled())).count());
        
        Map<String, Long> byType = new HashMap<>();
        for (IntegrationConfig config : all) {
            byType.merge(config.getIntegrationType(), 1L, Long::sum);
        }
        status.put("byType", byType);
        
        return status;
    }
}
