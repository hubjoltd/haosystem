package com.erp.repository;

import com.erp.model.Timesheet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TimesheetRepository extends JpaRepository<Timesheet, Long> {
    
    Optional<Timesheet> findByTimesheetNumber(String timesheetNumber);
    
    List<Timesheet> findByEmployeeId(Long employeeId);
    
    List<Timesheet> findByStatus(String status);
    
    List<Timesheet> findByPeriodStartDateBetween(LocalDate startDate, LocalDate endDate);
    
    Optional<Timesheet> findByEmployeeIdAndPeriodStartDateAndPeriodEndDate(Long employeeId, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT t FROM Timesheet t WHERE t.employee.id = :employeeId AND t.status = 'APPROVED' AND t.periodStartDate >= :startDate AND t.periodEndDate <= :endDate")
    List<Timesheet> findApprovedTimesheetsByEmployeeAndPeriod(@Param("employeeId") Long employeeId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT t FROM Timesheet t WHERE t.status = 'APPROVED' AND t.periodStartDate >= :startDate AND t.periodEndDate <= :endDate")
    List<Timesheet> findApprovedTimesheetsByPeriod(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
