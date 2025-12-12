package com.erp.repository;

import com.erp.model.PRFulfillment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PRFulfillmentRepository extends JpaRepository<PRFulfillment, Long> {
    List<PRFulfillment> findByPrId(Long prId);
    List<PRFulfillment> findByFulfillmentType(String fulfillmentType);
    List<PRFulfillment> findAllByOrderByCreatedAtDesc();
}
