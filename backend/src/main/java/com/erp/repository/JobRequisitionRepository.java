package com.erp.repository;

import com.erp.model.JobRequisition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobRequisitionRepository extends JpaRepository<JobRequisition, Long> {
    Optional<JobRequisition> findByRequisitionNumber(String requisitionNumber);
    
    List<JobRequisition> findByStatus(String status);
    
    List<JobRequisition> findByDepartmentId(Long departmentId);
    
    List<JobRequisition> findByRequestedById(Long requestedById);
    
    List<JobRequisition> findByLocationId(Long locationId);
    
    List<JobRequisition> findByPriority(String priority);
    
    @Query("SELECT jr FROM JobRequisition jr WHERE jr.status IN ('APPROVED', 'OPEN') AND jr.filledPositions < jr.numberOfPositions")
    List<JobRequisition> findOpenRequisitions();
    
    @Query("SELECT jr FROM JobRequisition jr WHERE jr.status = :status AND jr.department.id = :departmentId")
    List<JobRequisition> findByStatusAndDepartment(@Param("status") String status, @Param("departmentId") Long departmentId);
}
