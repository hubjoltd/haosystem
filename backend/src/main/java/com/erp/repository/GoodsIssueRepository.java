package com.erp.repository;

import com.erp.model.GoodsIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface GoodsIssueRepository extends JpaRepository<GoodsIssue, Long> {
    List<GoodsIssue> findByIssueDateBetween(LocalDate start, LocalDate end);
    List<GoodsIssue> findByCustomerId(Long customerId);
}
