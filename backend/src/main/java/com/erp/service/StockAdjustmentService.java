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
public class StockAdjustmentService {
    
    @Autowired
    private StockAdjustmentRepository stockAdjustmentRepository;
    
    @Autowired
    private ItemRepository itemRepository;
    
    @Autowired
    private InventoryLedgerRepository inventoryLedgerRepository;
    
    public List<StockAdjustment> findAll() {
        return stockAdjustmentRepository.findAll();
    }
    
    public Optional<StockAdjustment> findById(Long id) {
        return stockAdjustmentRepository.findById(id);
    }
    
    @Transactional
    public StockAdjustment save(StockAdjustment adjustment) {
        boolean isNew = adjustment.getId() == null;
        
        if (isNew) {
            adjustment.setCreatedAt(LocalDate.now());
            if (adjustment.getAdjustmentNumber() == null || adjustment.getAdjustmentNumber().isEmpty()) {
                adjustment.setAdjustmentNumber(generateAdjustmentNumber());
            }
        }
        
        Item item = adjustment.getItem();
        int currentStock = item.getCurrentStock() != null ? item.getCurrentStock() : 0;
        adjustment.setQuantityBefore(currentStock);
        
        int newStock;
        if ("INCREASE".equals(adjustment.getAdjustmentType())) {
            newStock = currentStock + adjustment.getQuantityAdjusted();
        } else {
            newStock = currentStock - adjustment.getQuantityAdjusted();
        }
        adjustment.setQuantityAfter(newStock);
        
        BigDecimal costPrice = item.getUnitCost() != null ? item.getUnitCost() : BigDecimal.ZERO;
        BigDecimal valueDiff = costPrice.multiply(BigDecimal.valueOf(adjustment.getQuantityAdjusted()));
        if ("DECREASE".equals(adjustment.getAdjustmentType())) {
            valueDiff = valueDiff.negate();
        }
        adjustment.setValueDifference(valueDiff);
        
        item.setCurrentStock(newStock);
        itemRepository.save(item);
        
        InventoryLedger ledger = new InventoryLedger();
        ledger.setItem(item);
        ledger.setWarehouse(adjustment.getWarehouse());
        ledger.setBin(adjustment.getBin());
        ledger.setTransactionType("ADJUSTMENT");
        ledger.setReferenceNumber(adjustment.getAdjustmentNumber());
        if ("INCREASE".equals(adjustment.getAdjustmentType())) {
            ledger.setQuantityIn(adjustment.getQuantityAdjusted());
            ledger.setQuantityOut(0);
        } else {
            ledger.setQuantityIn(0);
            ledger.setQuantityOut(adjustment.getQuantityAdjusted());
        }
        ledger.setBalanceQuantity(newStock);
        ledger.setUnitValue(costPrice);
        ledger.setTotalValue(valueDiff.abs());
        ledger.setTransactionDate(LocalDateTime.now());
        ledger.setRemarks(adjustment.getReason());
        inventoryLedgerRepository.save(ledger);
        
        return stockAdjustmentRepository.save(adjustment);
    }
    
    private String generateAdjustmentNumber() {
        long count = stockAdjustmentRepository.count() + 1;
        return String.format("ADJ-%06d", count);
    }
    
    public void delete(Long id) {
        stockAdjustmentRepository.deleteById(id);
    }
    
    @Transactional
    public StockAdjustment saveWithoutStockUpdate(StockAdjustment adjustment) {
        if (adjustment.getAdjustmentNumber() == null || adjustment.getAdjustmentNumber().isEmpty()) {
            adjustment.setAdjustmentNumber(generateAdjustmentNumber());
        }
        if (adjustment.getCreatedAt() == null) {
            adjustment.setCreatedAt(LocalDate.now());
        }
        
        return stockAdjustmentRepository.save(adjustment);
    }
}
