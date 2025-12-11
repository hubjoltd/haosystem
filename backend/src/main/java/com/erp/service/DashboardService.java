package com.erp.service;

import com.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {
    
    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private ContractRepository contractRepository;
    
    @Autowired
    private ItemRepository itemRepository;
    
    @Autowired
    private WarehouseRepository warehouseRepository;
    
    @Autowired
    private GoodsReceiptRepository goodsReceiptRepository;
    
    @Autowired
    private GoodsIssueRepository goodsIssueRepository;
    
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalCustomers", customerRepository.count());
        stats.put("totalContracts", contractRepository.count());
        stats.put("totalItems", itemRepository.count());
        stats.put("totalWarehouses", warehouseRepository.count());
        stats.put("totalGRN", goodsReceiptRepository.count());
        stats.put("totalIssues", goodsIssueRepository.count());
        
        BigDecimal totalInventoryValue = itemRepository.findAll().stream()
            .filter(item -> item.getCurrentStock() != null && item.getUnitCost() != null)
            .map(item -> item.getUnitCost().multiply(BigDecimal.valueOf(item.getCurrentStock())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("totalInventoryValue", totalInventoryValue);
        
        long lowStockItems = itemRepository.findAll().stream()
            .filter(item -> item.getCurrentStock() != null && item.getReorderLevel() != null 
                && item.getCurrentStock() <= item.getReorderLevel())
            .count();
        stats.put("lowStockItems", lowStockItems);
        
        return stats;
    }
}
