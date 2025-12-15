package com.erp.repository;

import com.erp.model.CustomerGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerGroupRepository extends JpaRepository<CustomerGroup, Long> {
    Optional<CustomerGroup> findByName(String name);
}
