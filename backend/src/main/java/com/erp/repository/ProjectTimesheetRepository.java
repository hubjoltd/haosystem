package com.erp.repository;

import com.erp.model.ProjectTimesheet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProjectTimesheetRepository extends JpaRepository<ProjectTimesheet, Long> {
    List<ProjectTimesheet> findByEmployeeId(Long employeeId);
    List<ProjectTimesheet> findByStatus(String status);
    List<ProjectTimesheet> findByProjectCode(String projectCode);
    List<ProjectTimesheet> findByPeriodStartDateBetween(LocalDate startDate, LocalDate endDate);
    List<ProjectTimesheet> findAllByOrderByCreatedAtDesc();
}
