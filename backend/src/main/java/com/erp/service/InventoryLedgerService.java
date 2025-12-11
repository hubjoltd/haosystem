package com.erp.service;

import com.erp.model.InventoryLedger;
import com.erp.repository.InventoryLedgerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class InventoryLedgerService {
    
    @Autowired
    private InventoryLedgerRepository inventoryLedgerRepository;
    
    public List<InventoryLedger> findAll() {
        return inventoryLedgerRepository.findAll();
    }
    
    public List<InventoryLedger> findByItemId(Long itemId) {
        return inventoryLedgerRepository.findByItemId(itemId);
    }
    
    public List<InventoryLedger> findByWarehouseId(Long warehouseId) {
        return inventoryLedgerRepository.findByWarehouseId(warehouseId);
    }
    
    public List<InventoryLedger> findByDateRange(LocalDateTime start, LocalDateTime end) {
        return inventoryLedgerRepository.findByTransactionDateBetween(start, end);
    }
    
    public List<InventoryLedger> findByItemAndDateRange(Long itemId, LocalDateTime start, LocalDateTime end) {
        return inventoryLedgerRepository.findByItemIdAndTransactionDateBetween(itemId, start, end);
    }
}
