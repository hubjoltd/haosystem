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
public class GoodsReceiptService {
    
    @Autowired
    private GoodsReceiptRepository goodsReceiptRepository;
    
    @Autowired
    private GoodsReceiptLineRepository goodsReceiptLineRepository;
    
    @Autowired
    private ItemRepository itemRepository;
    
    @Autowired
    private InventoryLedgerRepository inventoryLedgerRepository;
    
    public List<GoodsReceipt> findAll() {
        return goodsReceiptRepository.findAll();
    }
    
    public Optional<GoodsReceipt> findById(Long id) {
        return goodsReceiptRepository.findById(id);
    }
    
    public List<GoodsReceiptLine> findLinesByGrnId(Long grnId) {
        return goodsReceiptLineRepository.findByGoodsReceiptId(grnId);
    }
    
    @Transactional
    public GoodsReceipt save(GoodsReceipt grn, List<GoodsReceiptLine> lines) {
        grn.setCreatedAt(LocalDate.now());
        grn.setGrnNumber(generateGrnNumber());
        GoodsReceipt savedGrn = goodsReceiptRepository.save(grn);
        
        BigDecimal totalValue = BigDecimal.ZERO;
        for (GoodsReceiptLine line : lines) {
            line.setGoodsReceipt(savedGrn);
            line.setLineTotal(line.getUnitPrice().multiply(BigDecimal.valueOf(line.getQuantity())));
            totalValue = totalValue.add(line.getLineTotal());
            goodsReceiptLineRepository.save(line);
            
            Item item = line.getItem();
            int newStock = (item.getCurrentStock() != null ? item.getCurrentStock() : 0) + line.getQuantity();
            item.setCurrentStock(newStock);
            itemRepository.save(item);
            
            InventoryLedger ledger = new InventoryLedger();
            ledger.setItem(item);
            ledger.setWarehouse(grn.getWarehouse());
            ledger.setBin(line.getBin());
            ledger.setTransactionType("GRN");
            ledger.setReferenceNumber(savedGrn.getGrnNumber());
            ledger.setQuantityIn(line.getQuantity());
            ledger.setQuantityOut(0);
            ledger.setBalanceQuantity(newStock);
            ledger.setUnitValue(line.getUnitPrice());
            ledger.setTotalValue(line.getLineTotal());
            ledger.setTransactionDate(LocalDateTime.now());
            inventoryLedgerRepository.save(ledger);
        }
        
        savedGrn.setTotalValue(totalValue);
        return goodsReceiptRepository.save(savedGrn);
    }
    
    private String generateGrnNumber() {
        long count = goodsReceiptRepository.count() + 1;
        return String.format("GRN-%06d", count);
    }
    
    public void delete(Long id) {
        goodsReceiptRepository.deleteById(id);
    }
}
