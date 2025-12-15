package com.erp.repository;

import com.erp.model.EmployeeBankDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeBankDetailRepository extends JpaRepository<EmployeeBankDetail, Long> {
    List<EmployeeBankDetail> findByEmployeeId(Long employeeId);
    
    Optional<EmployeeBankDetail> findByEmployeeIdAndIsPrimaryTrue(Long employeeId);
    
    List<EmployeeBankDetail> findByEmployeeIdAndActiveTrue(Long employeeId);
}
