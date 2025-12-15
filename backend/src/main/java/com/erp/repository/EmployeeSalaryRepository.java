package com.erp.repository;

import com.erp.model.EmployeeSalary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeSalaryRepository extends JpaRepository<EmployeeSalary, Long> {
    List<EmployeeSalary> findByEmployeeId(Long employeeId);
    
    Optional<EmployeeSalary> findByEmployeeIdAndIsCurrentTrue(Long employeeId);
    
    List<EmployeeSalary> findByEmployeeIdOrderByEffectiveFromDesc(Long employeeId);
}
