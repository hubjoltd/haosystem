package com.erp.repository;

import com.erp.model.PRFulfillmentItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PRFulfillmentItemRepository extends JpaRepository<PRFulfillmentItem, Long> {
    List<PRFulfillmentItem> findByPrFulfillmentId(Long fulfillmentId);
}
