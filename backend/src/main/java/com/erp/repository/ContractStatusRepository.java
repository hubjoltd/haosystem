package com.erp.repository;

import com.erp.model.ContractStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContractStatusRepository extends JpaRepository<ContractStatus, Long> {
}
