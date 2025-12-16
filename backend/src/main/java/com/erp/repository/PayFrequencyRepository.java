package com.erp.repository;

import com.erp.model.PayFrequency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayFrequencyRepository extends JpaRepository<PayFrequency, Long> {
    
    Optional<PayFrequency> findByCode(String code);
    
    List<PayFrequency> findByIsActiveTrue();
    
    Optional<PayFrequency> findByIsDefaultTrue();
}
