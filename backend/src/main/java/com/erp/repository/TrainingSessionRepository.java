package com.erp.repository;

import com.erp.model.TrainingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TrainingSessionRepository extends JpaRepository<TrainingSession, Long> {
    Optional<TrainingSession> findBySessionCode(String sessionCode);
    
    List<TrainingSession> findByProgramId(Long programId);
    
    List<TrainingSession> findByStatus(String status);
    
    List<TrainingSession> findByTrainerId(Long trainerId);
    
    List<TrainingSession> findByVenueContaining(String venue);
    
    @Query("SELECT ts FROM TrainingSession ts WHERE ts.status = 'SCHEDULED' AND ts.startDate >= :today")
    List<TrainingSession> findUpcomingSessions(@Param("today") LocalDate today);
    
    @Query("SELECT ts FROM TrainingSession ts WHERE ts.startDate BETWEEN :start AND :end")
    List<TrainingSession> findSessionsBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);
    
    @Query("SELECT ts FROM TrainingSession ts WHERE ts.status = 'SCHEDULED' AND ts.enrolledCount < ts.maxParticipants")
    List<TrainingSession> findSessionsWithAvailableSeats();
}
