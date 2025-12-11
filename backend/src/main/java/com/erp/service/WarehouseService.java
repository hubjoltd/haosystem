package com.erp.service;

import com.erp.model.Warehouse;
import com.erp.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class WarehouseService {
    
    @Autowired
    private WarehouseRepository warehouseRepository;
    
    public List<Warehouse> findAll() {
        return warehouseRepository.findAll();
    }
    
    public List<Warehouse> findAllActive() {
        return warehouseRepository.findByStatus("Active");
    }
    
    public Optional<Warehouse> findById(Long id) {
        return warehouseRepository.findById(id);
    }
    
    public Optional<Warehouse> findByCode(String code) {
        return warehouseRepository.findByCode(code);
    }
    
    public boolean existsByCode(String code) {
        return warehouseRepository.existsByCode(code);
    }
    
    @Transactional
    public Warehouse save(Warehouse warehouse) {
        if (warehouse.getStatus() == null) {
            warehouse.setStatus("Active");
        }
        return warehouseRepository.save(warehouse);
    }
    
    @Transactional
    public Warehouse update(Long id, Warehouse warehouse) {
        Optional<Warehouse> existingOpt = warehouseRepository.findById(id);
        if (existingOpt.isPresent()) {
            Warehouse existing = existingOpt.get();
            existing.setCode(warehouse.getCode());
            existing.setName(warehouse.getName());
            existing.setAddress(warehouse.getAddress());
            existing.setDefaultBin(warehouse.getDefaultBin());
            existing.setStatus(warehouse.getStatus());
            existing.setUpdatedBy(warehouse.getUpdatedBy());
            return warehouseRepository.save(existing);
        }
        warehouse.setId(id);
        return warehouseRepository.save(warehouse);
    }
    
    @Transactional
    public void delete(Long id) {
        warehouseRepository.deleteById(id);
    }
}
