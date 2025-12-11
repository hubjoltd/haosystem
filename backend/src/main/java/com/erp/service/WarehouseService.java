package com.erp.service;

import com.erp.model.Warehouse;
import com.erp.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class WarehouseService {
    
    @Autowired
    private WarehouseRepository warehouseRepository;
    
    public List<Warehouse> findAll() {
        return warehouseRepository.findAll();
    }
    
    public Optional<Warehouse> findById(Long id) {
        return warehouseRepository.findById(id);
    }
    
    public Warehouse save(Warehouse warehouse) {
        if (warehouse.getUsedCapacity() == null) {
            warehouse.setUsedCapacity(0);
        }
        return warehouseRepository.save(warehouse);
    }
    
    public Warehouse update(Long id, Warehouse warehouse) {
        warehouse.setId(id);
        return warehouseRepository.save(warehouse);
    }
    
    public void delete(Long id) {
        warehouseRepository.deleteById(id);
    }
}
