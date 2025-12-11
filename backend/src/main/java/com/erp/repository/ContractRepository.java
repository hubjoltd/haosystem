package com.erp.repository;

import com.erp.model.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {
    List<Contract> findByCustomerId(Long customerId);
    List<Contract> findByStatus(String status);
}
