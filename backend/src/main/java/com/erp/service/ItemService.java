package com.erp.service;

import com.erp.model.Item;
import com.erp.model.ItemGroup;
import com.erp.model.UnitOfMeasure;
import com.erp.model.Supplier;
import com.erp.repository.ItemRepository;
import com.erp.repository.ItemGroupRepository;
import com.erp.repository.UnitOfMeasureRepository;
import com.erp.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class ItemService {
    
    @Autowired
    private ItemRepository itemRepository;
    
    @Autowired
    private ItemGroupRepository itemGroupRepository;
    
    @Autowired
    private UnitOfMeasureRepository unitOfMeasureRepository;
    
    @Autowired
    private SupplierRepository supplierRepository;
    
    public List<Item> findAll() {
        return itemRepository.findAll();
    }
    
    public List<Item> findAllActive() {
        return itemRepository.findByStatus("Active");
    }
    
    public Optional<Item> findById(Long id) {
        return itemRepository.findById(id);
    }
    
    public Optional<Item> findByCode(String code) {
        return itemRepository.findByCode(code);
    }
    
    public List<Item> findByGroupId(Long groupId) {
        return itemRepository.findByGroupId(groupId);
    }
    
    public boolean existsByNameInGroup(String name, Long groupId) {
        return itemRepository.existsByNameAndGroupId(name, groupId);
    }
    
    public boolean isNameUniqueInGroup(String name, Long groupId, Long excludeItemId) {
        if (excludeItemId == null) {
            return !itemRepository.existsByNameAndGroupId(name, groupId);
        }
        return itemRepository.findDuplicateName(groupId, name, excludeItemId).isEmpty();
    }
    
    @Transactional
    public Item save(Item item) {
        if (item.getCurrentStock() == null) {
            item.setCurrentStock(0);
        }
        if (item.getTaxable() == null) {
            item.setTaxable(true);
        }
        if (item.getStatus() == null) {
            item.setStatus("Active");
        }
        if (item.getCode() == null || item.getCode().isEmpty()) {
            item.setCode("ITM-" + System.currentTimeMillis());
        }
        return itemRepository.save(item);
    }
    
    @Transactional
    public Item update(Long id, Item item) {
        Optional<Item> existingOpt = itemRepository.findById(id);
        if (existingOpt.isPresent()) {
            Item existing = existingOpt.get();
            existing.setName(item.getName());
            existing.setDescription(item.getDescription());
            existing.setGroup(item.getGroup());
            existing.setUnitOfMeasure(item.getUnitOfMeasure());
            existing.setUnitCost(item.getUnitCost());
            existing.setSupplier(item.getSupplier());
            existing.setTaxable(item.getTaxable());
            existing.setReorderLevel(item.getReorderLevel());
            existing.setStatus(item.getStatus());
            existing.setUpdatedBy(item.getUpdatedBy());
            return itemRepository.save(existing);
        }
        item.setId(id);
        return itemRepository.save(item);
    }
    
    @Transactional
    public void delete(Long id) {
        itemRepository.deleteById(id);
    }
    
    public long count() {
        return itemRepository.count();
    }
    
    public long countActive() {
        return itemRepository.countByStatus("Active");
    }
    
    public List<Item> findLowStockItems() {
        return itemRepository.findLowStockItems();
    }
}
