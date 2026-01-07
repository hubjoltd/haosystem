package com.erp.service;

import com.erp.model.*;
import com.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
public class TrainingService {

    @Autowired
    private TrainingProgramRepository programRepository;

    @Autowired
    private TrainingSessionRepository sessionRepository;

    @Autowired
    private TrainingEnrollmentRepository enrollmentRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private LocationRepository locationRepository;

    public List<TrainingProgram> findAllPrograms() {
        return programRepository.findAll();
    }

    public Optional<TrainingProgram> findProgramById(Long id) {
        return programRepository.findById(id);
    }

    public List<TrainingProgram> findActivePrograms() {
        return programRepository.findByIsActive(true);
    }

    public List<TrainingProgram> findMandatoryPrograms() {
        return programRepository.findActiveMandatoryPrograms();
    }

    public List<TrainingProgram> searchPrograms(String search) {
        return programRepository.searchPrograms(search);
    }

    @Transactional
    public TrainingProgram createProgram(Map<String, Object> data) {
        TrainingProgram program = new TrainingProgram();
        program.setProgramCode(generateProgramCode());
        updateProgramFromMap(program, data);
        program.setIsActive(true);
        return programRepository.save(program);
    }

    @Transactional
    public TrainingProgram updateProgram(Long id, Map<String, Object> data) {
        TrainingProgram program = programRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Training program not found"));
        updateProgramFromMap(program, data);
        return programRepository.save(program);
    }

    private void updateProgramFromMap(TrainingProgram program, Map<String, Object> data) {
        if (data.containsKey("name")) program.setName((String) data.get("name"));
        if (data.containsKey("description")) program.setDescription((String) data.get("description"));
        if (data.containsKey("category")) program.setCategory((String) data.get("category"));
        if (data.containsKey("trainingType")) program.setTrainingType((String) data.get("trainingType"));
        if (data.containsKey("durationHours")) program.setDurationHours(Integer.valueOf(data.get("durationHours").toString()));
        if (data.containsKey("durationDays")) program.setDurationDays(Integer.valueOf(data.get("durationDays").toString()));
        if (data.containsKey("objectives")) program.setObjectives((String) data.get("objectives"));
        if (data.containsKey("curriculum")) program.setCurriculum((String) data.get("curriculum"));
        if (data.containsKey("prerequisites")) program.setPrerequisites((String) data.get("prerequisites"));
        if (data.containsKey("targetAudience")) program.setTargetAudience((String) data.get("targetAudience"));
        if (data.containsKey("mandatory")) program.setIsMandatory((Boolean) data.get("mandatory"));
        if (data.containsKey("hasCertification")) program.setHasCertification((Boolean) data.get("hasCertification"));
        if (data.containsKey("costPerParticipant") && data.get("costPerParticipant") != null) {
            program.setCostPerParticipant(new BigDecimal(data.get("costPerParticipant").toString()));
        }
        if (data.containsKey("externalProvider")) program.setExternalProvider((String) data.get("externalProvider"));
    }

    @Transactional
    public void deleteProgram(Long id) {
        programRepository.deleteById(id);
    }

    public List<TrainingSession> findAllSessions() {
        return sessionRepository.findAll();
    }

    public Optional<TrainingSession> findSessionById(Long id) {
        return sessionRepository.findById(id);
    }

    public List<TrainingSession> findSessionsByProgram(Long programId) {
        return sessionRepository.findByProgramId(programId);
    }

    public List<TrainingSession> findUpcomingSessions() {
        return sessionRepository.findUpcomingSessions(LocalDate.now());
    }

    public List<TrainingSession> findSessionsBetween(LocalDate start, LocalDate end) {
        return sessionRepository.findSessionsBetween(start, end);
    }

    public List<TrainingSession> findSessionsWithAvailableSeats() {
        return sessionRepository.findSessionsWithAvailableSeats();
    }

    @Transactional
    public TrainingSession createSession(Map<String, Object> data) {
        TrainingSession session = new TrainingSession();
        session.setSessionCode(generateSessionCode());
        updateSessionFromMap(session, data);
        session.setStatus("SCHEDULED");
        session.setEnrolledCount(0);
        return sessionRepository.save(session);
    }

    @Transactional
    public TrainingSession updateSession(Long id, Map<String, Object> data) {
        TrainingSession session = sessionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Training session not found"));
        updateSessionFromMap(session, data);
        return sessionRepository.save(session);
    }

    private void updateSessionFromMap(TrainingSession session, Map<String, Object> data) {
        if (data.containsKey("trainingProgramId") && data.get("trainingProgramId") != null) {
            programRepository.findById(Long.valueOf(data.get("trainingProgramId").toString())).ifPresent(session::setProgram);
        } else if (data.containsKey("programId") && data.get("programId") != null) {
            programRepository.findById(Long.valueOf(data.get("programId").toString())).ifPresent(session::setProgram);
        }
        if (data.containsKey("trainerId") && data.get("trainerId") != null) {
            employeeRepository.findById(Long.valueOf(data.get("trainerId").toString())).ifPresent(session::setTrainer);
        }
        if (data.containsKey("venue") && data.get("venue") != null) {
            session.setVenue((String) data.get("venue"));
        }
        if (data.containsKey("startDate") && data.get("startDate") != null) {
            session.setStartDate(LocalDate.parse((String) data.get("startDate")));
        }
        if (data.containsKey("endDate") && data.get("endDate") != null) {
            session.setEndDate(LocalDate.parse((String) data.get("endDate")));
        }
        if (data.containsKey("startTime") && data.get("startTime") != null) {
            session.setStartTime(LocalTime.parse((String) data.get("startTime")));
        }
        if (data.containsKey("endTime") && data.get("endTime") != null) {
            session.setEndTime(LocalTime.parse((String) data.get("endTime")));
        }
        if (data.containsKey("onlineLink")) session.setOnlineLink((String) data.get("onlineLink"));
        if (data.containsKey("maxParticipants")) session.setMaxParticipants(Integer.valueOf(data.get("maxParticipants").toString()));
        if (data.containsKey("externalTrainer")) session.setExternalTrainer((String) data.get("externalTrainer"));
        if (data.containsKey("notes")) session.setNotes((String) data.get("notes"));
    }

    @Transactional
    public TrainingSession startSession(Long id) {
        TrainingSession session = sessionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Training session not found"));
        session.setStatus("IN_PROGRESS");
        return sessionRepository.save(session);
    }

    @Transactional
    public TrainingSession completeSession(Long id) {
        TrainingSession session = sessionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Training session not found"));
        session.setStatus("COMPLETED");
        return sessionRepository.save(session);
    }

    @Transactional
    public TrainingSession cancelSession(Long id, String reason) {
        TrainingSession session = sessionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Training session not found"));
        session.setStatus("CANCELLED");
        session.setNotes(reason);
        return sessionRepository.save(session);
    }

    @Transactional
    public void deleteSession(Long id) {
        sessionRepository.deleteById(id);
    }

    public List<TrainingEnrollment> findEnrollmentsByEmployee(Long employeeId) {
        return enrollmentRepository.findByEmployeeId(employeeId);
    }

    public List<TrainingEnrollment> findEnrollmentsBySession(Long sessionId) {
        return enrollmentRepository.findBySessionId(sessionId);
    }

    public List<TrainingEnrollment> findCertificatesByEmployee(Long employeeId) {
        return enrollmentRepository.findCertificatesByEmployee(employeeId);
    }

    @Transactional
    public TrainingEnrollment enrollEmployee(Long employeeId, Long sessionId, String enrolledBy) {
        Optional<TrainingEnrollment> existing = enrollmentRepository.findByEmployeeIdAndSessionId(employeeId, sessionId);
        if (existing.isPresent()) {
            throw new RuntimeException("Employee is already enrolled in this session");
        }

        TrainingSession session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new RuntimeException("Training session not found"));

        if (session.getEnrolledCount() >= session.getMaxParticipants()) {
            throw new RuntimeException("Session is full");
        }

        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        TrainingEnrollment enrollment = new TrainingEnrollment();
        enrollment.setEmployee(employee);
        enrollment.setSession(session);
        enrollment.setStatus("ENROLLED");
        enrollment.setEnrolledDate(LocalDate.now());

        TrainingEnrollment saved = enrollmentRepository.save(enrollment);

        session.setEnrolledCount(session.getEnrolledCount() + 1);
        sessionRepository.save(session);

        return saved;
    }

    @Transactional
    public TrainingEnrollment markAttendance(Long enrollmentId, boolean attended) {
        TrainingEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        enrollment.setAttended(attended);
        if (attended) {
            enrollment.setStatus("ATTENDED");
        } else {
            enrollment.setStatus("ABSENT");
        }
        return enrollmentRepository.save(enrollment);
    }

    @Transactional
    public TrainingEnrollment completeEnrollment(Long enrollmentId, Map<String, Object> completionData) {
        TrainingEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        
        enrollment.setStatus("COMPLETED");
        enrollment.setCompletedAt(LocalDateTime.now());
        
        if (completionData.containsKey("score")) {
            enrollment.setScore(Integer.valueOf(completionData.get("score").toString()));
        }
        if (completionData.containsKey("completed")) {
            enrollment.setCompleted((Boolean) completionData.get("completed"));
        }
        if (completionData.containsKey("feedback")) {
            enrollment.setFeedback((String) completionData.get("feedback"));
        }
        if (completionData.containsKey("rating")) {
            enrollment.setRating(Integer.valueOf(completionData.get("rating").toString()));
        }
        
        return enrollmentRepository.save(enrollment);
    }

    @Transactional
    public TrainingEnrollment issueCertificate(Long enrollmentId, String certificateNumber, LocalDate validUntil) {
        TrainingEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        
        enrollment.setCertificateIssued(true);
        enrollment.setCertificateNumber(certificateNumber);
        enrollment.setCertificateIssuedDate(LocalDate.now());
        enrollment.setCertificateExpiryDate(validUntil);
        
        return enrollmentRepository.save(enrollment);
    }

    @Transactional
    public void cancelEnrollment(Long enrollmentId) {
        TrainingEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        
        TrainingSession session = enrollment.getSession();
        
        enrollmentRepository.deleteById(enrollmentId);
        
        session.setEnrolledCount(Math.max(0, session.getEnrolledCount() - 1));
        sessionRepository.save(session);
    }

    public Map<String, Object> getTrainingDashboard() {
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("totalPrograms", programRepository.count());
        dashboard.put("activePrograms", programRepository.findByIsActive(true).size());
        dashboard.put("upcomingSessions", sessionRepository.findUpcomingSessions(LocalDate.now()).size());
        dashboard.put("availableSeats", sessionRepository.findSessionsWithAvailableSeats().size());
        dashboard.put("totalEnrollments", enrollmentRepository.count());
        return dashboard;
    }

    private String generateProgramCode() {
        String prefix = "TRN";
        long count = programRepository.count() + 1;
        return prefix + "-" + String.format("%05d", count);
    }

    private String generateSessionCode() {
        String prefix = "SES";
        String year = String.valueOf(LocalDate.now().getYear());
        long count = sessionRepository.count() + 1;
        return prefix + "-" + year + "-" + String.format("%05d", count);
    }
}
