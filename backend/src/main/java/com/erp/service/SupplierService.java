package com.erp.service;

import com.erp.model.Supplier;
import com.erp.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class SupplierService {
    
    @Autowired
    private SupplierRepository supplierRepository;
    
    public List<Supplier> findAll() {
        return supplierRepository.findAll();
    }
    
    public Optional<Supplier> findById(Long id) {
        return supplierRepository.findById(id);
    }
    
    public Supplier save(Supplier supplier) {
        return supplierRepository.save(supplier);
    }
    
    public Supplier update(Long id, Supplier supplier) {
        supplier.setId(id);
        return supplierRepository.save(supplier);
    }
    
    public void delete(Long id) {
        supplierRepository.deleteById(id);
    }
}
