package com.erp.repository;

import com.erp.model.LeaveBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {
    
    List<LeaveBalance> findByEmployeeId(Long employeeId);
    
    List<LeaveBalance> findByEmployeeIdAndYear(Long employeeId, Integer year);
    
    Optional<LeaveBalance> findByEmployeeIdAndLeaveTypeIdAndYear(Long employeeId, Long leaveTypeId, Integer year);
    
    List<LeaveBalance> findByLeaveTypeIdAndYear(Long leaveTypeId, Integer year);
    
    @Query("SELECT lb FROM LeaveBalance lb WHERE lb.employee.id = :employeeId AND lb.year = :year")
    List<LeaveBalance> findEmployeeBalancesForYear(@Param("employeeId") Long employeeId, @Param("year") Integer year);
}
