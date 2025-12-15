package com.erp.repository;

import com.erp.model.EmployeeExperience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeExperienceRepository extends JpaRepository<EmployeeExperience, Long> {
    List<EmployeeExperience> findByEmployeeId(Long employeeId);
    
    List<EmployeeExperience> findByEmployeeIdOrderByFromDateDesc(Long employeeId);
}
