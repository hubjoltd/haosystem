package com.erp.repository;

import com.erp.model.EmployeeBenefit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeBenefitRepository extends JpaRepository<EmployeeBenefit, Long> {
    
    List<EmployeeBenefit> findByEmployeeId(Long employeeId);
    
    List<EmployeeBenefit> findByEmployeeIdAndIsActiveTrue(Long employeeId);
    
    List<EmployeeBenefit> findByBenefitType(String benefitType);
    
    List<EmployeeBenefit> findByEmployeeIdAndBenefitType(Long employeeId, String benefitType);
    
    List<EmployeeBenefit> findByIsPreTaxTrue();
    
    List<EmployeeBenefit> findByEmployeeIdAndIsPreTaxTrueAndIsActiveTrue(Long employeeId);
}
