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
public class StockTransferService {
    
    @Autowired
    private StockTransferRepository stockTransferRepository;
    
    @Autowired
    private StockTransferLineRepository stockTransferLineRepository;
    
    @Autowired
    private InventoryLedgerRepository inventoryLedgerRepository;
    
    public List<StockTransfer> findAll() {
        return stockTransferRepository.findAll();
    }
    
    public Optional<StockTransfer> findById(Long id) {
        return stockTransferRepository.findById(id);
    }
    
    public List<StockTransferLine> findLinesByTransferId(Long transferId) {
        return stockTransferLineRepository.findByStockTransferId(transferId);
    }
    
    @Transactional
    public StockTransfer save(StockTransfer transfer, List<StockTransferLine> lines) {
        transfer.setCreatedAt(LocalDate.now());
        transfer.setTransferNumber(generateTransferNumber());
        StockTransfer savedTransfer = stockTransferRepository.save(transfer);
        
        for (StockTransferLine line : lines) {
            line.setStockTransfer(savedTransfer);
            stockTransferLineRepository.save(line);
            
            InventoryLedger outLedger = new InventoryLedger();
            outLedger.setItem(line.getItem());
            outLedger.setWarehouse(transfer.getFromWarehouse());
            outLedger.setBin(line.getFromBin());
            outLedger.setTransactionType("TRANSFER_OUT");
            outLedger.setReferenceNumber(savedTransfer.getTransferNumber());
            outLedger.setQuantityIn(0);
            outLedger.setQuantityOut(line.getQuantity());
            outLedger.setBalanceQuantity(line.getItem().getCurrentStock());
            outLedger.setUnitValue(line.getItem().getUnitCost());
            outLedger.setTotalValue(line.getItem().getUnitCost() != null ? 
                line.getItem().getUnitCost().multiply(BigDecimal.valueOf(line.getQuantity())) : BigDecimal.ZERO);
            outLedger.setTransactionDate(LocalDateTime.now());
            inventoryLedgerRepository.save(outLedger);
            
            InventoryLedger inLedger = new InventoryLedger();
            inLedger.setItem(line.getItem());
            inLedger.setWarehouse(transfer.getToWarehouse());
            inLedger.setBin(line.getToBin());
            inLedger.setTransactionType("TRANSFER_IN");
            inLedger.setReferenceNumber(savedTransfer.getTransferNumber());
            inLedger.setQuantityIn(line.getQuantity());
            inLedger.setQuantityOut(0);
            inLedger.setBalanceQuantity(line.getItem().getCurrentStock());
            inLedger.setUnitValue(line.getItem().getUnitCost());
            inLedger.setTotalValue(line.getItem().getUnitCost() != null ? 
                line.getItem().getUnitCost().multiply(BigDecimal.valueOf(line.getQuantity())) : BigDecimal.ZERO);
            inLedger.setTransactionDate(LocalDateTime.now());
            inventoryLedgerRepository.save(inLedger);
        }
        
        return savedTransfer;
    }
    
    private String generateTransferNumber() {
        long count = stockTransferRepository.count() + 1;
        return String.format("ST-%06d", count);
    }
    
    public void delete(Long id) {
        stockTransferRepository.deleteById(id);
    }
}
