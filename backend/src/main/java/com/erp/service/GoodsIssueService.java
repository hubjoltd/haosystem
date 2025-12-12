package com.erp.service;

import com.erp.model.*;
import com.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class GoodsIssueService {
    
    @Autowired
    private GoodsIssueRepository goodsIssueRepository;
    
    @Autowired
    private GoodsIssueLineRepository goodsIssueLineRepository;
    
    @Autowired
    private ItemRepository itemRepository;
    
    @Autowired
    private InventoryLedgerRepository inventoryLedgerRepository;
    
    @Autowired
    private ValuationService valuationService;
    
    public List<GoodsIssue> findAll() {
        return goodsIssueRepository.findAll();
    }
    
    public Optional<GoodsIssue> findById(Long id) {
        return goodsIssueRepository.findById(id);
    }
    
    public List<GoodsIssueLine> findLinesByIssueId(Long issueId) {
        return goodsIssueLineRepository.findByGoodsIssueId(issueId);
    }
    
    @Transactional
    public GoodsIssue save(GoodsIssue issue, List<GoodsIssueLine> lines) {
        issue.setCreatedAt(LocalDate.now());
        issue.setIssueNumber(generateIssueNumber());
        GoodsIssue savedIssue = goodsIssueRepository.save(issue);
        
        BigDecimal totalValue = BigDecimal.ZERO;
        for (GoodsIssueLine line : lines) {
            line.setGoodsIssue(savedIssue);
            
            // Use valuation engine to consume stock and get actual cost
            ValuationService.ConsumptionResult consumption = valuationService.consumeStock(
                line.getItem().getId(),
                issue.getWarehouse() != null ? issue.getWarehouse().getId() : null,
                line.getQuantity()
            );
            
            // Use calculated cost from valuation engine instead of provided unit price
            BigDecimal actualUnitCost = consumption.getUnitCost();
            BigDecimal actualTotalCost = consumption.getTotalCost();
            
            line.setUnitPrice(actualUnitCost);
            line.setLineTotal(actualTotalCost);
            totalValue = totalValue.add(actualTotalCost);
            goodsIssueLineRepository.save(line);
            
            Item item = line.getItem();
            int newStock = (item.getCurrentStock() != null ? item.getCurrentStock() : 0) - line.getQuantity();
            item.setCurrentStock(newStock);
            itemRepository.save(item);
            
            InventoryLedger ledger = new InventoryLedger();
            ledger.setItem(item);
            ledger.setWarehouse(issue.getWarehouse());
            ledger.setBin(line.getBin());
            ledger.setTransactionType("GOODS_ISSUE");
            ledger.setReferenceNumber(savedIssue.getIssueNumber());
            ledger.setQuantityIn(0);
            ledger.setQuantityOut(line.getQuantity());
            ledger.setBalanceQuantity(newStock);
            ledger.setUnitValue(actualUnitCost);
            ledger.setTotalValue(actualTotalCost);
            ledger.setTransactionDate(LocalDateTime.now());
            ledger.setRemarks("Valuation: " + valuationService.getValuationMethod());
            inventoryLedgerRepository.save(ledger);
        }
        
        savedIssue.setTotalValue(totalValue);
        return goodsIssueRepository.save(savedIssue);
    }
    
    private String generateIssueNumber() {
        long count = goodsIssueRepository.count() + 1;
        return String.format("GI-%06d", count);
    }
    
    public void delete(Long id) {
        goodsIssueRepository.deleteById(id);
    }
}
