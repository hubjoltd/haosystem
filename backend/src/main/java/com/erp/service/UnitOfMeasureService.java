package com.erp.service;

import com.erp.model.UnitOfMeasure;
import com.erp.repository.UnitOfMeasureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class UnitOfMeasureService {
    
    @Autowired
    private UnitOfMeasureRepository unitOfMeasureRepository;
    
    public List<UnitOfMeasure> findAll() {
        return unitOfMeasureRepository.findAll();
    }
    
    public List<UnitOfMeasure> findAllActive() {
        return unitOfMeasureRepository.findByStatus("Active");
    }
    
    public List<UnitOfMeasure> findAllBaseUnits() {
        return unitOfMeasureRepository.findByBaseUomIsNull();
    }
    
    public Optional<UnitOfMeasure> findById(Long id) {
        return unitOfMeasureRepository.findById(id);
    }
    
    public Optional<UnitOfMeasure> findByCode(String code) {
        return unitOfMeasureRepository.findByCode(code);
    }
    
    public boolean existsByCode(String code) {
        return unitOfMeasureRepository.existsByCode(code);
    }
    
    @Transactional
    public UnitOfMeasure save(UnitOfMeasure unit) {
        if (unit.getStatus() == null) {
            unit.setStatus("Active");
        }
        if (unit.getConversionFactor() == null) {
            unit.setConversionFactor(BigDecimal.ONE);
        }
        return unitOfMeasureRepository.save(unit);
    }
    
    @Transactional
    public UnitOfMeasure update(Long id, UnitOfMeasure unit) {
        Optional<UnitOfMeasure> existingOpt = unitOfMeasureRepository.findById(id);
        if (existingOpt.isPresent()) {
            UnitOfMeasure existing = existingOpt.get();
            existing.setCode(unit.getCode());
            existing.setName(unit.getName());
            existing.setSymbol(unit.getSymbol());
            existing.setConversionFactor(unit.getConversionFactor());
            existing.setBaseUom(unit.getBaseUom());
            existing.setStatus(unit.getStatus());
            existing.setUpdatedBy(unit.getUpdatedBy());
            return unitOfMeasureRepository.save(existing);
        }
        unit.setId(id);
        return unitOfMeasureRepository.save(unit);
    }
    
    @Transactional
    public void delete(Long id) {
        unitOfMeasureRepository.deleteById(id);
    }
}
