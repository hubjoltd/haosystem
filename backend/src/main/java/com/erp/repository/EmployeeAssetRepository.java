package com.erp.repository;

import com.erp.model.EmployeeAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeAssetRepository extends JpaRepository<EmployeeAsset, Long> {
    List<EmployeeAsset> findByEmployeeId(Long employeeId);
    
    List<EmployeeAsset> findByStatus(String status);
    
    List<EmployeeAsset> findByApprovalStatus(String approvalStatus);
    
    List<EmployeeAsset> findByEmployeeIdAndStatus(Long employeeId, String status);
}
