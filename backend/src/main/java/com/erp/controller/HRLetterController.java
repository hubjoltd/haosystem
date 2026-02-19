package com.erp.controller;

import com.erp.model.*;
import com.erp.service.HRLetterService;
import com.erp.service.UserNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hr-letters")
@CrossOrigin(origins = "*")
public class HRLetterController {

    @Autowired
    private HRLetterService hrLetterService;

    @Autowired
    private UserNotificationService userNotificationService;

    @GetMapping
    public ResponseEntity<List<HRLetter>> getAllLetters() {
        return ResponseEntity.ok(hrLetterService.findAllLetters());
    }

    @GetMapping("/{id}")
    public ResponseEntity<HRLetter> getLetter(@PathVariable Long id) {
        return hrLetterService.findLetterById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<HRLetter>> getLettersByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(hrLetterService.findLettersByEmployee(employeeId));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<HRLetter>> getLettersByType(@PathVariable String type) {
        return ResponseEntity.ok(hrLetterService.findLettersByType(type));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<HRLetter>> getLettersByStatus(@PathVariable String status) {
        return ResponseEntity.ok(hrLetterService.findLettersByStatus(status));
    }

    @PostMapping
    public ResponseEntity<HRLetter> createLetter(@RequestBody Map<String, Object> data) {
        HRLetter letter = hrLetterService.createLetter(data);
        try {
            if (letter.getEmployee() != null) {
                userNotificationService.notifyEmployee(letter.getEmployee(),
                    "HR Letter Generated",
                    "A " + letter.getLetterType() + " letter has been generated for you",
                    "HR_LETTER", "HR_LETTER", letter.getId());
            }
            userNotificationService.notifyAdminsAndHR(
                "HR Letter Created",
                "A " + letter.getLetterType() + " letter has been created",
                "HR_LETTER", "HR_LETTER", letter.getId());
        } catch (Exception e) {}
        return ResponseEntity.ok(letter);
    }

    @PutMapping("/{id}")
    public ResponseEntity<HRLetter> updateLetter(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(hrLetterService.updateLetter(id, data));
    }

    @PostMapping("/{id}/generate")
    public ResponseEntity<HRLetter> generateLetter(@PathVariable Long id) {
        HRLetter letter = hrLetterService.generateLetter(id);
        try {
            if (letter.getEmployee() != null) {
                userNotificationService.notifyEmployee(letter.getEmployee(),
                    "HR Letter Generated",
                    "A " + letter.getLetterType() + " letter has been generated for you",
                    "HR_LETTER", "HR_LETTER", letter.getId());
            }
            userNotificationService.notifyAdminsAndHR(
                "HR Letter Generated",
                "A " + letter.getLetterType() + " letter has been generated",
                "HR_LETTER", "HR_LETTER", letter.getId());
        } catch (Exception e) {}
        return ResponseEntity.ok(letter);
    }

    @PostMapping("/{id}/sign")
    public ResponseEntity<HRLetter> signLetter(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        String signedBy = (String) data.get("signedBy");
        String designation = (String) data.get("designation");
        return ResponseEntity.ok(hrLetterService.signLetter(id, signedBy, designation));
    }

    @PostMapping("/{id}/issue")
    public ResponseEntity<HRLetter> issueLetter(@PathVariable Long id) {
        return ResponseEntity.ok(hrLetterService.issueLetter(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLetter(@PathVariable Long id) {
        hrLetterService.deleteLetter(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/generate/offer/{employeeId}")
    public ResponseEntity<HRLetter> generateOfferLetter(@PathVariable Long employeeId, @RequestBody Map<String, Object> offerDetails) {
        return ResponseEntity.ok(hrLetterService.generateOfferLetter(employeeId, offerDetails));
    }

    @PostMapping("/generate/appointment/{employeeId}")
    public ResponseEntity<HRLetter> generateAppointmentLetter(@PathVariable Long employeeId) {
        return ResponseEntity.ok(hrLetterService.generateAppointmentLetter(employeeId));
    }

    @PostMapping("/generate/experience/{employeeId}")
    public ResponseEntity<HRLetter> generateExperienceLetter(@PathVariable Long employeeId, @RequestBody Map<String, Object> data) {
        LocalDate lastWorkingDate = LocalDate.parse((String) data.get("lastWorkingDate"));
        return ResponseEntity.ok(hrLetterService.generateExperienceLetter(employeeId, lastWorkingDate));
    }

    @PostMapping("/generate/warning/{employeeId}")
    public ResponseEntity<HRLetter> generateWarningLetter(@PathVariable Long employeeId, @RequestBody Map<String, Object> data) {
        String reason = (String) data.get("reason");
        String warningLevel = (String) data.get("warningLevel");
        return ResponseEntity.ok(hrLetterService.generateWarningLetter(employeeId, reason, warningLevel));
    }

    @PostMapping("/generate/salary-revision/{employeeId}")
    public ResponseEntity<HRLetter> generateSalaryRevisionLetter(@PathVariable Long employeeId, @RequestBody Map<String, Object> revisionDetails) {
        return ResponseEntity.ok(hrLetterService.generateSalaryRevisionLetter(employeeId, revisionDetails));
    }
}
