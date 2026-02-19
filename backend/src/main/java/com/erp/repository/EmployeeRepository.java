package com.erp.repository;

import com.erp.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmployeeCode(String employeeCode);
    
    List<Employee> findAllByOrderByIdDesc();
    
    List<Employee> findAllByOrderByIdAsc();
    
    List<Employee> findByBranchIdOrderByIdAsc(Long branchId);
    
    @Query(value = "SELECT e.employee_code FROM employees e WHERE e.employee_code LIKE CONCAT(:prefix, '%') AND LENGTH(e.employee_code) > LENGTH(:prefix) ORDER BY LENGTH(e.employee_code) DESC, e.employee_code DESC LIMIT 1", nativeQuery = true)
    String findLastEmployeeCodeByPrefix(@Param("prefix") String prefix);
    
    Optional<Employee> findByEmail(String email);
    
    List<Employee> findByActiveTrue();
    
    List<Employee> findByDepartmentId(Long departmentId);
    
    List<Employee> findByDesignationId(Long designationId);
    
    List<Employee> findByLocationId(Long locationId);
    
    List<Employee> findByReportingManagerId(Long managerId);
    
    @Query("SELECT e FROM Employee e WHERE e.active = true AND " +
           "(LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.employeeCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Employee> searchEmployees(@Param("search") String search);
    
    @Query("SELECT e FROM Employee e WHERE e.employmentStatus = :status")
    List<Employee> findByEmploymentStatus(@Param("status") String status);
    
    List<Employee> findByBranchIdOrderByIdDesc(Long branchId);
    
    List<Employee> findByBranchIdAndActiveTrue(Long branchId);
    
    @Query("SELECT e FROM Employee e WHERE e.branch.id = :branchId AND e.active = true AND " +
           "(LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.employeeCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Employee> searchEmployeesByBranch(@Param("branchId") Long branchId, @Param("search") String search);
    
    Optional<Employee> findByIdAndBranchId(Long id, Long branchId);
}
