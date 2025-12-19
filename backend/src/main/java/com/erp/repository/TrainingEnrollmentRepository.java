package com.erp.repository;

import com.erp.model.TrainingEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrainingEnrollmentRepository extends JpaRepository<TrainingEnrollment, Long> {
    List<TrainingEnrollment> findByEmployeeId(Long employeeId);
    
    List<TrainingEnrollment> findBySessionId(Long sessionId);
    
    List<TrainingEnrollment> findByStatus(String status);
    
    Optional<TrainingEnrollment> findByEmployeeIdAndSessionId(Long employeeId, Long sessionId);
    
    @Query("SELECT te FROM TrainingEnrollment te WHERE te.employee.id = :employeeId AND te.status = 'COMPLETED'")
    List<TrainingEnrollment> findCompletedEnrollmentsByEmployee(@Param("employeeId") Long employeeId);
    
    @Query("SELECT te FROM TrainingEnrollment te WHERE te.session.id = :sessionId AND te.status = 'ENROLLED'")
    List<TrainingEnrollment> findActiveEnrollmentsBySession(@Param("sessionId") Long sessionId);
    
    @Query("SELECT te FROM TrainingEnrollment te WHERE te.certificateIssued = true AND te.employee.id = :employeeId")
    List<TrainingEnrollment> findCertificatesByEmployee(@Param("employeeId") Long employeeId);
    
    @Query("SELECT COUNT(te) FROM TrainingEnrollment te WHERE te.session.id = :sessionId AND te.status = 'ENROLLED'")
    Long countEnrolledBySession(@Param("sessionId") Long sessionId);
}
