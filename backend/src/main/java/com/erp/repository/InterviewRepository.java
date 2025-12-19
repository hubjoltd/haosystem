package com.erp.repository;

import com.erp.model.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByCandidateId(Long candidateId);
    
    List<Interview> findByInterviewerId(Long interviewerId);
    
    List<Interview> findByStatus(String status);
    
    List<Interview> findByInterviewType(String interviewType);
    
    @Query("SELECT i FROM Interview i WHERE i.interviewer.id = :interviewerId AND i.interviewDate = :date")
    List<Interview> findByInterviewerAndDate(@Param("interviewerId") Long interviewerId, @Param("date") LocalDate date);
    
    @Query("SELECT i FROM Interview i WHERE i.status = 'SCHEDULED' AND i.interviewDate BETWEEN :startDate AND :endDate")
    List<Interview> findScheduledInterviewsBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT i FROM Interview i WHERE i.candidate.id = :candidateId ORDER BY i.interviewDate DESC")
    List<Interview> findByCandidateIdOrderByScheduledAtDesc(@Param("candidateId") Long candidateId);
    
    @Query("SELECT i FROM Interview i WHERE i.status = 'SCHEDULED' AND i.interviewDate < :today")
    List<Interview> findOverdueInterviews(@Param("today") LocalDate today);
    
    List<Interview> findByStatusAndInterviewDateGreaterThanEqual(String status, LocalDate date);
}
