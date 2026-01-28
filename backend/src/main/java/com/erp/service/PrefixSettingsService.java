package com.erp.service;

import com.erp.model.PrefixSettings;
import com.erp.repository.PrefixSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PrefixSettingsService {

    @Autowired
    private PrefixSettingsRepository prefixSettingsRepository;

    public PrefixSettings getSettings() {
        return prefixSettingsRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> {
                    PrefixSettings settings = new PrefixSettings();
                    return prefixSettingsRepository.save(settings);
                });
    }

    @Transactional
    public PrefixSettings saveSettings(PrefixSettings settings) {
        PrefixSettings existing = getSettings();
        settings.setId(existing.getId());
        return prefixSettingsRepository.save(settings);
    }

    public String previewNextId(String type) {
        PrefixSettings settings = getSettings();
        String prefix;
        int nextNumber;
        
        switch (type.toLowerCase()) {
            case "item":
                prefix = settings.getItemPrefix();
                nextNumber = settings.getItemNextNumber();
                break;
            case "group":
                prefix = settings.getGroupPrefix();
                nextNumber = settings.getGroupNextNumber();
                break;
            case "warehouse":
                prefix = settings.getWarehousePrefix();
                nextNumber = settings.getWarehouseNextNumber();
                break;
            case "bin":
                prefix = settings.getBinPrefix();
                nextNumber = settings.getBinNextNumber();
                break;
            case "supplier":
                prefix = settings.getSupplierPrefix();
                nextNumber = settings.getSupplierNextNumber();
                break;
            case "unit":
                prefix = settings.getUnitPrefix();
                nextNumber = settings.getUnitNextNumber();
                break;
            case "pr":
                prefix = settings.getPrPrefix();
                nextNumber = settings.getPrNextNumber();
                break;
            case "po":
                prefix = settings.getPoPrefix();
                nextNumber = settings.getPoNextNumber();
                break;
            case "grn":
                prefix = settings.getGrnPrefix();
                nextNumber = settings.getGrnNextNumber();
                break;
            case "issue":
                prefix = settings.getIssuePrefix();
                nextNumber = settings.getIssueNextNumber();
                break;
            case "transfer":
                prefix = settings.getTransferPrefix();
                nextNumber = settings.getTransferNextNumber();
                break;
            case "adjustment":
                prefix = settings.getAdjustmentPrefix();
                nextNumber = settings.getAdjustmentNextNumber();
                break;
            default:
                throw new IllegalArgumentException("Unknown type: " + type);
        }
        
        return prefix + String.format("%04d", nextNumber);
    }

    @Transactional
    public String generateNextId(String type) {
        PrefixSettings settings = getSettings();
        String prefix;
        int nextNumber;
        
        switch (type.toLowerCase()) {
            case "item":
                prefix = settings.getItemPrefix();
                nextNumber = settings.getItemNextNumber();
                settings.setItemNextNumber(nextNumber + 1);
                break;
            case "group":
                prefix = settings.getGroupPrefix();
                nextNumber = settings.getGroupNextNumber();
                settings.setGroupNextNumber(nextNumber + 1);
                break;
            case "warehouse":
                prefix = settings.getWarehousePrefix();
                nextNumber = settings.getWarehouseNextNumber();
                settings.setWarehouseNextNumber(nextNumber + 1);
                break;
            case "bin":
                prefix = settings.getBinPrefix();
                nextNumber = settings.getBinNextNumber();
                settings.setBinNextNumber(nextNumber + 1);
                break;
            case "supplier":
                prefix = settings.getSupplierPrefix();
                nextNumber = settings.getSupplierNextNumber();
                settings.setSupplierNextNumber(nextNumber + 1);
                break;
            case "unit":
                prefix = settings.getUnitPrefix();
                nextNumber = settings.getUnitNextNumber();
                settings.setUnitNextNumber(nextNumber + 1);
                break;
            case "pr":
                prefix = settings.getPrPrefix();
                nextNumber = settings.getPrNextNumber();
                settings.setPrNextNumber(nextNumber + 1);
                break;
            case "po":
                prefix = settings.getPoPrefix();
                nextNumber = settings.getPoNextNumber();
                settings.setPoNextNumber(nextNumber + 1);
                break;
            case "grn":
                prefix = settings.getGrnPrefix();
                nextNumber = settings.getGrnNextNumber();
                settings.setGrnNextNumber(nextNumber + 1);
                break;
            case "issue":
                prefix = settings.getIssuePrefix();
                nextNumber = settings.getIssueNextNumber();
                settings.setIssueNextNumber(nextNumber + 1);
                break;
            case "transfer":
                prefix = settings.getTransferPrefix();
                nextNumber = settings.getTransferNextNumber();
                settings.setTransferNextNumber(nextNumber + 1);
                break;
            case "adjustment":
                prefix = settings.getAdjustmentPrefix();
                nextNumber = settings.getAdjustmentNextNumber();
                settings.setAdjustmentNextNumber(nextNumber + 1);
                break;
            default:
                throw new IllegalArgumentException("Unknown type: " + type);
        }
        
        prefixSettingsRepository.save(settings);
        return prefix + String.format("%04d", nextNumber);
    }
}
