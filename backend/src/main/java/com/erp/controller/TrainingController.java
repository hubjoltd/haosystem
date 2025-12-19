package com.erp.controller;

import com.erp.model.*;
import com.erp.service.TrainingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/training")
@CrossOrigin(origins = "*")
public class TrainingController {

    @Autowired
    private TrainingService trainingService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(trainingService.getTrainingDashboard());
    }

    @GetMapping("/programs")
    public ResponseEntity<List<TrainingProgram>> getAllPrograms() {
        return ResponseEntity.ok(trainingService.findAllPrograms());
    }

    @GetMapping("/programs/{id}")
    public ResponseEntity<TrainingProgram> getProgram(@PathVariable Long id) {
        return trainingService.findProgramById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/programs/active")
    public ResponseEntity<List<TrainingProgram>> getActivePrograms() {
        return ResponseEntity.ok(trainingService.findActivePrograms());
    }

    @GetMapping("/programs/mandatory")
    public ResponseEntity<List<TrainingProgram>> getMandatoryPrograms() {
        return ResponseEntity.ok(trainingService.findMandatoryPrograms());
    }

    @GetMapping("/programs/search")
    public ResponseEntity<List<TrainingProgram>> searchPrograms(@RequestParam String q) {
        return ResponseEntity.ok(trainingService.searchPrograms(q));
    }

    @PostMapping("/programs")
    public ResponseEntity<TrainingProgram> createProgram(@RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(trainingService.createProgram(data));
    }

    @PutMapping("/programs/{id}")
    public ResponseEntity<TrainingProgram> updateProgram(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(trainingService.updateProgram(id, data));
    }

    @DeleteMapping("/programs/{id}")
    public ResponseEntity<Void> deleteProgram(@PathVariable Long id) {
        trainingService.deleteProgram(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<TrainingSession>> getAllSessions() {
        return ResponseEntity.ok(trainingService.findAllSessions());
    }

    @GetMapping("/sessions/{id}")
    public ResponseEntity<TrainingSession> getSession(@PathVariable Long id) {
        return trainingService.findSessionById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/sessions/program/{programId}")
    public ResponseEntity<List<TrainingSession>> getSessionsByProgram(@PathVariable Long programId) {
        return ResponseEntity.ok(trainingService.findSessionsByProgram(programId));
    }

    @GetMapping("/sessions/upcoming")
    public ResponseEntity<List<TrainingSession>> getUpcomingSessions() {
        return ResponseEntity.ok(trainingService.findUpcomingSessions());
    }

    @GetMapping("/sessions/available")
    public ResponseEntity<List<TrainingSession>> getSessionsWithAvailableSeats() {
        return ResponseEntity.ok(trainingService.findSessionsWithAvailableSeats());
    }

    @GetMapping("/sessions/between")
    public ResponseEntity<List<TrainingSession>> getSessionsBetween(
            @RequestParam String start, @RequestParam String end) {
        LocalDate startDate = LocalDate.parse(start);
        LocalDate endDate = LocalDate.parse(end);
        return ResponseEntity.ok(trainingService.findSessionsBetween(startDate, endDate));
    }

    @PostMapping("/sessions")
    public ResponseEntity<TrainingSession> createSession(@RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(trainingService.createSession(data));
    }

    @PutMapping("/sessions/{id}")
    public ResponseEntity<TrainingSession> updateSession(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(trainingService.updateSession(id, data));
    }

    @PostMapping("/sessions/{id}/start")
    public ResponseEntity<TrainingSession> startSession(@PathVariable Long id) {
        return ResponseEntity.ok(trainingService.startSession(id));
    }

    @PostMapping("/sessions/{id}/complete")
    public ResponseEntity<TrainingSession> completeSession(@PathVariable Long id) {
        return ResponseEntity.ok(trainingService.completeSession(id));
    }

    @PostMapping("/sessions/{id}/cancel")
    public ResponseEntity<TrainingSession> cancelSession(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        String reason = (String) data.get("reason");
        return ResponseEntity.ok(trainingService.cancelSession(id, reason));
    }

    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        trainingService.deleteSession(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/enrollments/employee/{employeeId}")
    public ResponseEntity<List<TrainingEnrollment>> getEnrollmentsByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(trainingService.findEnrollmentsByEmployee(employeeId));
    }

    @GetMapping("/enrollments/session/{sessionId}")
    public ResponseEntity<List<TrainingEnrollment>> getEnrollmentsBySession(@PathVariable Long sessionId) {
        return ResponseEntity.ok(trainingService.findEnrollmentsBySession(sessionId));
    }

    @GetMapping("/certificates/employee/{employeeId}")
    public ResponseEntity<List<TrainingEnrollment>> getCertificatesByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(trainingService.findCertificatesByEmployee(employeeId));
    }

    @PostMapping("/enrollments")
    public ResponseEntity<TrainingEnrollment> enrollEmployee(@RequestBody Map<String, Object> data) {
        Long employeeId = Long.valueOf(data.get("employeeId").toString());
        Long sessionId = Long.valueOf(data.get("sessionId").toString());
        String enrolledBy = (String) data.get("enrolledBy");
        return ResponseEntity.ok(trainingService.enrollEmployee(employeeId, sessionId, enrolledBy));
    }

    @PostMapping("/enrollments/{id}/attendance")
    public ResponseEntity<TrainingEnrollment> markAttendance(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        boolean attended = (Boolean) data.get("attended");
        return ResponseEntity.ok(trainingService.markAttendance(id, attended));
    }

    @PostMapping("/enrollments/{id}/complete")
    public ResponseEntity<TrainingEnrollment> completeEnrollment(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(trainingService.completeEnrollment(id, data));
    }

    @PostMapping("/enrollments/{id}/certificate")
    public ResponseEntity<TrainingEnrollment> issueCertificate(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        String certificateNumber = (String) data.get("certificateNumber");
        LocalDate validUntil = null;
        if (data.containsKey("validUntil")) {
            validUntil = LocalDate.parse((String) data.get("validUntil"));
        }
        return ResponseEntity.ok(trainingService.issueCertificate(id, certificateNumber, validUntil));
    }

    @DeleteMapping("/enrollments/{id}")
    public ResponseEntity<Void> cancelEnrollment(@PathVariable Long id) {
        trainingService.cancelEnrollment(id);
        return ResponseEntity.ok().build();
    }
}
