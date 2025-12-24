package com.erp.repository;

import com.erp.model.AttendanceRecord;
import com.erp.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    
    List<AttendanceRecord> findByEmployeeId(Long employeeId);
    
    List<AttendanceRecord> findByAttendanceDate(LocalDate date);
    
    List<AttendanceRecord> findByEmployeeIdAndAttendanceDateBetween(Long employeeId, LocalDate startDate, LocalDate endDate);
    
    List<AttendanceRecord> findByAttendanceDateBetween(LocalDate startDate, LocalDate endDate);
    
    Optional<AttendanceRecord> findByEmployeeIdAndAttendanceDate(Long employeeId, LocalDate date);
    
    List<AttendanceRecord> findByStatus(String status);
    
    List<AttendanceRecord> findByApprovalStatus(String approvalStatus);
    
    @Query("SELECT a FROM AttendanceRecord a WHERE a.attendanceDate = :date AND a.status = :status")
    List<AttendanceRecord> findByDateAndStatus(@Param("date") LocalDate date, @Param("status") String status);
    
    @Query("SELECT COUNT(a) FROM AttendanceRecord a WHERE a.attendanceDate = :date AND a.status = 'PRESENT'")
    long countPresentByDate(@Param("date") LocalDate date);
    
    @Query("SELECT COUNT(a) FROM AttendanceRecord a WHERE a.attendanceDate = :date AND a.status = 'ABSENT'")
    long countAbsentByDate(@Param("date") LocalDate date);
    
    @Query("SELECT COUNT(a) FROM AttendanceRecord a WHERE a.attendanceDate = :date AND a.status = 'ON_LEAVE'")
    long countOnLeaveByDate(@Param("date") LocalDate date);
    
    @Query("SELECT COUNT(a) FROM AttendanceRecord a WHERE a.attendanceDate = :date AND a.lateArrival = true")
    long countLateArrivalsByDate(@Param("date") LocalDate date);
    
    @Query("SELECT SUM(a.overtimeHours) FROM AttendanceRecord a WHERE a.employee.id = :employeeId AND a.attendanceDate BETWEEN :startDate AND :endDate")
    Double sumOvertimeHoursByEmployeeAndDateRange(@Param("employeeId") Long employeeId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT a FROM AttendanceRecord a WHERE a.attendanceDate BETWEEN :startDate AND :endDate AND a.approvalStatus = 'APPROVED'")
    List<AttendanceRecord> findApprovedAttendanceBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT a FROM AttendanceRecord a WHERE a.employee.id = :employeeId AND a.attendanceDate BETWEEN :startDate AND :endDate AND a.approvalStatus = 'APPROVED'")
    List<AttendanceRecord> findApprovedAttendanceByEmployeeAndDateRange(@Param("employeeId") Long employeeId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
