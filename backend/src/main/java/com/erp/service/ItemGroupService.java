package com.erp.service;

import com.erp.model.ItemGroup;
import com.erp.repository.ItemGroupRepository;
import com.erp.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class ItemGroupService {
    
    @Autowired
    private ItemGroupRepository itemGroupRepository;
    
    @Autowired
    private ItemRepository itemRepository;
    
    public List<ItemGroup> findAll() {
        return itemGroupRepository.findAll();
    }
    
    public List<ItemGroup> findAllActive() {
        return itemGroupRepository.findByStatus("Active");
    }
    
    public Optional<ItemGroup> findById(Long id) {
        return itemGroupRepository.findById(id);
    }
    
    public Optional<ItemGroup> findByCode(String code) {
        return itemGroupRepository.findByCode(code);
    }
    
    public boolean existsByCode(String code) {
        return itemGroupRepository.existsByCode(code);
    }
    
    public boolean existsByName(String name) {
        return itemGroupRepository.existsByName(name);
    }
    
    @Transactional
    public ItemGroup save(ItemGroup itemGroup) {
        if (itemGroup.getStatus() == null) {
            itemGroup.setStatus("Active");
        }
        return itemGroupRepository.save(itemGroup);
    }
    
    @Transactional
    public ItemGroup update(Long id, ItemGroup itemGroup) {
        Optional<ItemGroup> existingOpt = itemGroupRepository.findById(id);
        if (existingOpt.isPresent()) {
            ItemGroup existing = existingOpt.get();
            existing.setCode(itemGroup.getCode());
            existing.setName(itemGroup.getName());
            existing.setDescription(itemGroup.getDescription());
            existing.setStatus(itemGroup.getStatus());
            existing.setUpdatedBy(itemGroup.getUpdatedBy());
            return itemGroupRepository.save(existing);
        }
        itemGroup.setId(id);
        return itemGroupRepository.save(itemGroup);
    }
    
    public boolean canDeactivate(Long groupId) {
        return !itemRepository.existsByGroupId(groupId);
    }
    
    @Transactional
    public boolean deactivate(Long id) {
        if (!canDeactivate(id)) {
            return false;
        }
        Optional<ItemGroup> groupOpt = itemGroupRepository.findById(id);
        if (groupOpt.isPresent()) {
            ItemGroup group = groupOpt.get();
            group.setStatus("Inactive");
            itemGroupRepository.save(group);
            return true;
        }
        return false;
    }
    
    @Transactional
    public void delete(Long id) {
        if (canDeactivate(id)) {
            itemGroupRepository.deleteById(id);
        } else {
            throw new RuntimeException("Cannot delete group with existing items");
        }
    }
    
    public long countItemsInGroup(Long groupId) {
        return itemRepository.countByGroupId(groupId);
    }
}
