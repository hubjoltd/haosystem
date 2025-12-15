package com.erp.repository;

import com.erp.model.CustomerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerStatusRepository extends JpaRepository<CustomerStatus, Long> {
    Optional<CustomerStatus> findByName(String name);
}
