package com.erp.repository;

import com.erp.model.GoodsIssueLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GoodsIssueLineRepository extends JpaRepository<GoodsIssueLine, Long> {
    List<GoodsIssueLine> findByGoodsIssueId(Long goodsIssueId);
}
