package com.erp.repository;

import com.erp.model.SalaryHead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SalaryHeadRepository extends JpaRepository<SalaryHead, Long> {
    
    Optional<SalaryHead> findByCode(String code);
    
    List<SalaryHead> findByIsActiveTrue();
    
    List<SalaryHead> findByHeadType(String headType);
    
    List<SalaryHead> findByCategory(String category);
    
    List<SalaryHead> findByHeadTypeAndIsActiveTrue(String headType);
    
    List<SalaryHead> findByCategoryAndIsActiveTrue(String category);
    
    List<SalaryHead> findByApplicableToInAndIsActiveTrue(List<String> applicableTo);
    
    List<SalaryHead> findAllByOrderByDisplayOrderAsc();
    
    List<SalaryHead> findByIsActiveTrueOrderByDisplayOrderAsc();
}
