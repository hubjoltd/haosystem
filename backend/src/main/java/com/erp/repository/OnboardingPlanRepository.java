package com.erp.repository;

import com.erp.model.OnboardingPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface OnboardingPlanRepository extends JpaRepository<OnboardingPlan, Long> {
    Optional<OnboardingPlan> findByEmployeeId(Long employeeId);
    
    List<OnboardingPlan> findByStatus(String status);
    
    List<OnboardingPlan> findByBuddyId(Long buddyId);
    
    List<OnboardingPlan> findByHrCoordinatorId(Long hrCoordinatorId);
    
    @Query("SELECT op FROM OnboardingPlan op WHERE op.status = 'IN_PROGRESS' AND op.targetCompletionDate < :today")
    List<OnboardingPlan> findOverduePlans(@Param("today") LocalDate today);
    
    @Query("SELECT op FROM OnboardingPlan op WHERE op.status = 'IN_PROGRESS' AND op.startDate BETWEEN :start AND :end")
    List<OnboardingPlan> findPlansStartingBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);
    
    @Query("SELECT op FROM OnboardingPlan op WHERE op.progressPercentage < 100 AND op.status = 'IN_PROGRESS'")
    List<OnboardingPlan> findIncompletePlans();
}
