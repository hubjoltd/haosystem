package com.erp.service;

import com.erp.model.UnitOfMeasure;
import com.erp.repository.UnitOfMeasureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UnitOfMeasureService {
    
    @Autowired
    private UnitOfMeasureRepository unitOfMeasureRepository;
    
    public List<UnitOfMeasure> findAll() {
        return unitOfMeasureRepository.findAll();
    }
    
    public Optional<UnitOfMeasure> findById(Long id) {
        return unitOfMeasureRepository.findById(id);
    }
    
    public UnitOfMeasure save(UnitOfMeasure unit) {
        return unitOfMeasureRepository.save(unit);
    }
    
    public UnitOfMeasure update(Long id, UnitOfMeasure unit) {
        unit.setId(id);
        return unitOfMeasureRepository.save(unit);
    }
    
    public void delete(Long id) {
        unitOfMeasureRepository.deleteById(id);
    }
}
