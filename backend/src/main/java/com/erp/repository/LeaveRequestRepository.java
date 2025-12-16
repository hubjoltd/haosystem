package com.erp.repository;

import com.erp.model.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    
    List<LeaveRequest> findByEmployeeId(Long employeeId);
    
    List<LeaveRequest> findByStatus(String status);
    
    List<LeaveRequest> findByEmployeeIdAndStatus(Long employeeId, String status);
    
    List<LeaveRequest> findByLeaveTypeId(Long leaveTypeId);
    
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.employee.id = :employeeId AND " +
           "((lr.startDate BETWEEN :startDate AND :endDate) OR (lr.endDate BETWEEN :startDate AND :endDate) OR " +
           "(lr.startDate <= :startDate AND lr.endDate >= :endDate))")
    List<LeaveRequest> findByEmployeeIdAndDateRange(@Param("employeeId") Long employeeId, 
                                                     @Param("startDate") LocalDate startDate, 
                                                     @Param("endDate") LocalDate endDate);
    
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.status = 'PENDING' ORDER BY lr.createdAt DESC")
    List<LeaveRequest> findPendingRequests();
    
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.approvedBy.id = :approverId")
    List<LeaveRequest> findByApproverId(@Param("approverId") Long approverId);
    
    @Query("SELECT SUM(lr.totalDays) FROM LeaveRequest lr WHERE lr.employee.id = :employeeId AND lr.leaveType.id = :leaveTypeId AND lr.status = 'APPROVED' AND YEAR(lr.startDate) = :year")
    Double sumApprovedLeavesByEmployeeAndTypeAndYear(@Param("employeeId") Long employeeId, @Param("leaveTypeId") Long leaveTypeId, @Param("year") int year);
    
    @Query("SELECT lr FROM LeaveRequest lr WHERE :date BETWEEN lr.startDate AND lr.endDate AND lr.status = 'APPROVED'")
    List<LeaveRequest> findApprovedLeavesOnDate(@Param("date") LocalDate date);
}
