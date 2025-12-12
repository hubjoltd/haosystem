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
        return inventoryLedgerRepository.findAllByOrderByTransactionDateDesc();
    }
    
    public List<InventoryLedger> findByItemId(Long itemId) {
        return inventoryLedgerRepository.findByItemIdOrderByTransactionDateDesc(itemId);
    }
    
    public List<InventoryLedger> findByWarehouseId(Long warehouseId) {
        return inventoryLedgerRepository.findByWarehouseIdOrderByTransactionDateDesc(warehouseId);
    }
    
    public List<InventoryLedger> findByDateRange(LocalDateTime start, LocalDateTime end) {
        return inventoryLedgerRepository.findByTransactionDateBetweenOrderByTransactionDateDesc(start, end);
    }
    
    public List<InventoryLedger> findByItemAndDateRange(Long itemId, LocalDateTime start, LocalDateTime end) {
        return inventoryLedgerRepository.findByItemIdAndTransactionDateBetweenOrderByTransactionDateDesc(itemId, start, end);
    }
    
    public List<InventoryLedger> findWithFilters(Long itemId, Long warehouseId, LocalDateTime startDate, LocalDateTime endDate) {
        return inventoryLedgerRepository.findWithFilters(itemId, warehouseId, startDate, endDate);
    }
}
