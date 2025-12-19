package com.erp.repository;

import com.erp.model.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    Optional<Candidate> findByCandidateNumber(String candidateNumber);
    
    Optional<Candidate> findByEmail(String email);
    
    List<Candidate> findByStatus(String status);
    
    List<Candidate> findByStage(String stage);
    
    List<Candidate> findByRequisitionId(Long requisitionId);
    
    List<Candidate> findByJobPostingId(Long jobPostingId);
    
    List<Candidate> findByAssignedRecruiterId(Long recruiterId);
    
    List<Candidate> findBySource(String source);
    
    @Query("SELECT c FROM Candidate c WHERE c.status = 'ACTIVE' AND c.stage = :stage")
    List<Candidate> findActiveCandidatesByStage(@Param("stage") String stage);
    
    @Query("SELECT c FROM Candidate c WHERE " +
           "LOWER(c.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.skills) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Candidate> searchCandidates(@Param("search") String search);
    
    @Query("SELECT c FROM Candidate c WHERE c.convertedEmployee IS NOT NULL")
    List<Candidate> findConvertedCandidates();
}
