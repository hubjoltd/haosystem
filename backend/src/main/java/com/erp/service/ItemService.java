package com.erp.service;

import com.erp.model.Item;
import com.erp.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ItemService {
    
    @Autowired
    private ItemRepository itemRepository;
    
    public List<Item> findAll() {
        return itemRepository.findAll();
    }
    
    public Optional<Item> findById(Long id) {
        return itemRepository.findById(id);
    }
    
    public Item save(Item item) {
        if (item.getCurrentStock() == null) {
            item.setCurrentStock(0);
        }
        return itemRepository.save(item);
    }
    
    public Item update(Long id, Item item) {
        item.setId(id);
        return itemRepository.save(item);
    }
    
    public void delete(Long id) {
        itemRepository.deleteById(id);
    }
    
    public long count() {
        return itemRepository.count();
    }
    
    public List<Item> findLowStockItems() {
        List<Item> allItems = itemRepository.findAll();
        return allItems.stream()
            .filter(item -> item.getCurrentStock() != null && item.getReorderLevel() != null 
                && item.getCurrentStock() <= item.getReorderLevel())
            .toList();
    }
}
