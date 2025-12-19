package com.erp.repository;

import com.erp.model.JobPosting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
    Optional<JobPosting> findByPostingNumber(String postingNumber);
    
    List<JobPosting> findByStatus(String status);
    
    List<JobPosting> findByRequisitionId(Long requisitionId);
    
    List<JobPosting> findByPostingType(String postingType);
    
    @Query("SELECT jp FROM JobPosting jp WHERE jp.status = 'ACTIVE' AND jp.closeDate >= :today")
    List<JobPosting> findActivePostings(@Param("today") LocalDate today);
    
    @Query("SELECT jp FROM JobPosting jp WHERE jp.status = 'ACTIVE' AND jp.isExternal = true AND jp.closeDate >= :today")
    List<JobPosting> findActiveExternalPostings(@Param("today") LocalDate today);
    
    @Query("SELECT jp FROM JobPosting jp WHERE jp.status = 'ACTIVE' AND jp.isInternal = true AND jp.closeDate >= :today")
    List<JobPosting> findActiveInternalPostings(@Param("today") LocalDate today);
}
