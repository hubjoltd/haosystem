package com.erp.service;

import com.erp.model.InventoryLedger;
import com.erp.repository.InventoryLedgerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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
        List<InventoryLedger> result = inventoryLedgerRepository.findAllByOrderByTransactionDateDesc();
        
        if (itemId != null) {
            result = result.stream()
                .filter(l -> l.getItem() != null && itemId.equals(l.getItem().getId()))
                .collect(Collectors.toList());
        }
        
        if (warehouseId != null) {
            result = result.stream()
                .filter(l -> l.getWarehouse() != null && warehouseId.equals(l.getWarehouse().getId()))
                .collect(Collectors.toList());
        }
        
        if (startDate != null) {
            result = result.stream()
                .filter(l -> l.getTransactionDate() != null && !l.getTransactionDate().isBefore(startDate))
                .collect(Collectors.toList());
        }
        
        if (endDate != null) {
            result = result.stream()
                .filter(l -> l.getTransactionDate() != null && !l.getTransactionDate().isAfter(endDate))
                .collect(Collectors.toList());
        }
        
        return result;
    }
}
