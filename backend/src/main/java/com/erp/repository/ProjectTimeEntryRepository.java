package com.erp.repository;

import com.erp.model.ProjectTimeEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProjectTimeEntryRepository extends JpaRepository<ProjectTimeEntry, Long> {
    
    List<ProjectTimeEntry> findByEmployeeId(Long employeeId);
    
    List<ProjectTimeEntry> findByProjectCode(String projectCode);
    
    List<ProjectTimeEntry> findByEmployeeIdAndEntryDateBetween(Long employeeId, LocalDate startDate, LocalDate endDate);
    
    List<ProjectTimeEntry> findByProjectCodeAndEntryDateBetween(String projectCode, LocalDate startDate, LocalDate endDate);
    
    List<ProjectTimeEntry> findByStatus(String status);
    
    List<ProjectTimeEntry> findByEmployeeIdAndProjectCode(Long employeeId, String projectCode);
    
    @Query("SELECT SUM(p.hoursWorked) FROM ProjectTimeEntry p WHERE p.employee.id = :employeeId AND p.entryDate BETWEEN :startDate AND :endDate")
    Double sumHoursWorkedByEmployeeAndDateRange(@Param("employeeId") Long employeeId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT SUM(p.hoursWorked) FROM ProjectTimeEntry p WHERE p.projectCode = :projectCode AND p.entryDate BETWEEN :startDate AND :endDate")
    Double sumHoursWorkedByProjectAndDateRange(@Param("projectCode") String projectCode, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
