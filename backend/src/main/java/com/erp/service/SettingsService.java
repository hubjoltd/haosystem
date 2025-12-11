package com.erp.service;

import com.erp.model.GeneralSettings;
import com.erp.model.FinanceSettings;
import com.erp.repository.GeneralSettingsRepository;
import com.erp.repository.FinanceSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class SettingsService {
    
    @Autowired
    private GeneralSettingsRepository generalSettingsRepository;
    
    @Autowired
    private FinanceSettingsRepository financeSettingsRepository;
    
    public GeneralSettings getGeneralSettings() {
        return generalSettingsRepository.findAll().stream().findFirst()
            .orElse(new GeneralSettings());
    }
    
    public GeneralSettings saveGeneralSettings(GeneralSettings settings) {
        Optional<GeneralSettings> existing = generalSettingsRepository.findAll().stream().findFirst();
        if (existing.isPresent()) {
            settings.setId(existing.get().getId());
        }
        return generalSettingsRepository.save(settings);
    }
    
    public FinanceSettings getFinanceSettings() {
        return financeSettingsRepository.findAll().stream().findFirst()
            .orElse(new FinanceSettings());
    }
    
    public FinanceSettings saveFinanceSettings(FinanceSettings settings) {
        Optional<FinanceSettings> existing = financeSettingsRepository.findAll().stream().findFirst();
        if (existing.isPresent()) {
            settings.setId(existing.get().getId());
        }
        return financeSettingsRepository.save(settings);
    }
}
