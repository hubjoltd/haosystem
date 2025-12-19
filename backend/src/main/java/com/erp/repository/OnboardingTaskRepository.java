package com.erp.repository;

import com.erp.model.OnboardingTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface OnboardingTaskRepository extends JpaRepository<OnboardingTask, Long> {
    List<OnboardingTask> findByOnboardingPlanId(Long onboardingPlanId);
    
    List<OnboardingTask> findByStatus(String status);
    
    List<OnboardingTask> findByAssignedToId(Long assignedToId);
    
    List<OnboardingTask> findByCategory(String category);
    
    @Query("SELECT ot FROM OnboardingTask ot WHERE ot.onboardingPlan.id = :planId ORDER BY ot.sortOrder")
    List<OnboardingTask> findByPlanIdOrderBySequence(@Param("planId") Long planId);
    
    @Query("SELECT ot FROM OnboardingTask ot WHERE ot.status = 'PENDING' AND ot.dueDate < :today")
    List<OnboardingTask> findOverdueTasks(@Param("today") LocalDate today);
    
    @Query("SELECT ot FROM OnboardingTask ot WHERE ot.assignedTo.id = :employeeId AND ot.status IN ('PENDING', 'IN_PROGRESS')")
    List<OnboardingTask> findPendingTasksForEmployee(@Param("employeeId") Long employeeId);
    
    @Query("SELECT COUNT(ot) FROM OnboardingTask ot WHERE ot.onboardingPlan.id = :planId AND ot.status = 'COMPLETED'")
    Long countCompletedTasksByPlanId(@Param("planId") Long planId);
    
    @Query("SELECT COUNT(ot) FROM OnboardingTask ot WHERE ot.onboardingPlan.id = :planId")
    Long countTotalTasksByPlanId(@Param("planId") Long planId);
}
