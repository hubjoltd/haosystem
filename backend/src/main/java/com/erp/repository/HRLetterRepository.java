package com.erp.repository;

import com.erp.model.HRLetter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HRLetterRepository extends JpaRepository<HRLetter, Long> {
    Optional<HRLetter> findByLetterNumber(String letterNumber);
    
    List<HRLetter> findByEmployeeId(Long employeeId);
    
    List<HRLetter> findByLetterType(String letterType);
    
    List<HRLetter> findByStatus(String status);
    
    @Query("SELECT hl FROM HRLetter hl WHERE hl.employee.id = :employeeId ORDER BY hl.generatedAt DESC")
    List<HRLetter> findByEmployeeIdOrderByDate(@Param("employeeId") Long employeeId);
    
    @Query("SELECT hl FROM HRLetter hl WHERE hl.letterType = :type AND hl.employee.id = :employeeId")
    List<HRLetter> findByTypeAndEmployee(@Param("type") String type, @Param("employeeId") Long employeeId);
}
