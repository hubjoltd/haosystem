package com.erp.service;

import com.erp.model.Bin;
import com.erp.repository.BinRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class BinService {
    
    @Autowired
    private BinRepository binRepository;
    
    public List<Bin> findAll() {
        return binRepository.findAll();
    }
    
    public Optional<Bin> findById(Long id) {
        return binRepository.findById(id);
    }
    
    public List<Bin> findByWarehouseId(Long warehouseId) {
        return binRepository.findByWarehouseId(warehouseId);
    }
    
    public Bin save(Bin bin) {
        if (bin.getUsedCapacity() == null) {
            bin.setUsedCapacity(0);
        }
        return binRepository.save(bin);
    }
    
    public Bin update(Long id, Bin bin) {
        bin.setId(id);
        return binRepository.save(bin);
    }
    
    public void delete(Long id) {
        binRepository.deleteById(id);
    }
}
