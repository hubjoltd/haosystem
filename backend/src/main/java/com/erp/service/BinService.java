package com.erp.service;

import com.erp.model.Bin;
import com.erp.repository.BinRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class BinService {
    
    @Autowired
    private BinRepository binRepository;
    
    public List<Bin> findAll() {
        return binRepository.findAll();
    }
    
    public List<Bin> findAllActive() {
        return binRepository.findByStatus("Active");
    }
    
    public Optional<Bin> findById(Long id) {
        return binRepository.findById(id);
    }
    
    public List<Bin> findByWarehouseId(Long warehouseId) {
        return binRepository.findByWarehouseId(warehouseId);
    }
    
    public boolean existsByCodeAndWarehouse(String code, Long warehouseId) {
        return binRepository.existsByCodeAndWarehouseId(code, warehouseId);
    }
    
    @Transactional
    public Bin save(Bin bin) {
        if (bin.getStatus() == null) {
            bin.setStatus("Active");
        }
        return binRepository.save(bin);
    }
    
    @Transactional
    public Bin update(Long id, Bin bin) {
        Optional<Bin> existingOpt = binRepository.findById(id);
        if (existingOpt.isPresent()) {
            Bin existing = existingOpt.get();
            existing.setCode(bin.getCode());
            existing.setName(bin.getName());
            existing.setWarehouse(bin.getWarehouse());
            existing.setZone(bin.getZone());
            existing.setAisle(bin.getAisle());
            existing.setRack(bin.getRack());
            existing.setShelf(bin.getShelf());
            existing.setStatus(bin.getStatus());
            existing.setUpdatedBy(bin.getUpdatedBy());
            return binRepository.save(existing);
        }
        bin.setId(id);
        return binRepository.save(bin);
    }
    
    @Transactional
    public void delete(Long id) {
        binRepository.deleteById(id);
    }
}
