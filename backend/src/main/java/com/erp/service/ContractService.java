package com.erp.service;

import com.erp.model.Contract;
import com.erp.repository.ContractRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ContractService {
    
    @Autowired
    private ContractRepository contractRepository;
    
    public List<Contract> findAll() {
        return contractRepository.findAll();
    }
    
    public Optional<Contract> findById(Long id) {
        return contractRepository.findById(id);
    }
    
    public List<Contract> findByCustomerId(Long customerId) {
        return contractRepository.findByCustomerId(customerId);
    }
    
    public Contract save(Contract contract) {
        contract.setCreatedAt(LocalDate.now());
        contract.setUpdatedAt(LocalDate.now());
        return contractRepository.save(contract);
    }
    
    public Contract update(Long id, Contract contract) {
        contract.setId(id);
        contract.setUpdatedAt(LocalDate.now());
        return contractRepository.save(contract);
    }
    
    public void delete(Long id) {
        contractRepository.deleteById(id);
    }
    
    public long count() {
        return contractRepository.count();
    }
}
