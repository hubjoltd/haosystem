package com.erp.controller;

import com.erp.model.PrefixSettings;
import com.erp.service.PrefixSettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings/prefixes")
public class PrefixSettingsController {

    @Autowired
    private PrefixSettingsService prefixSettingsService;

    @GetMapping
    public ResponseEntity<PrefixSettings> getSettings() {
        return ResponseEntity.ok(prefixSettingsService.getSettings());
    }

    @PostMapping
    public ResponseEntity<PrefixSettings> saveSettings(@RequestBody PrefixSettings settings) {
        return ResponseEntity.ok(prefixSettingsService.saveSettings(settings));
    }

    @GetMapping("/generate/{type}")
    public ResponseEntity<String> generateNextId(@PathVariable String type) {
        try {
            String nextId = prefixSettingsService.generateNextId(type);
            return ResponseEntity.ok(nextId);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/preview/{type}")
    public ResponseEntity<String> previewNextId(@PathVariable String type) {
        try {
            String nextId = prefixSettingsService.previewNextId(type);
            return ResponseEntity.ok(nextId);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
