package com.erp.service;

import com.erp.model.ItemGroup;
import com.erp.repository.ItemGroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ItemGroupService {
    
    @Autowired
    private ItemGroupRepository itemGroupRepository;
    
    public List<ItemGroup> findAll() {
        return itemGroupRepository.findAll();
    }
    
    public Optional<ItemGroup> findById(Long id) {
        return itemGroupRepository.findById(id);
    }
    
    public ItemGroup save(ItemGroup itemGroup) {
        return itemGroupRepository.save(itemGroup);
    }
    
    public ItemGroup update(Long id, ItemGroup itemGroup) {
        itemGroup.setId(id);
        return itemGroupRepository.save(itemGroup);
    }
    
    public void delete(Long id) {
        itemGroupRepository.deleteById(id);
    }
}
