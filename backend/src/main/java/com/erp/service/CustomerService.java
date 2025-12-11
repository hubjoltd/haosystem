package com.erp.service;

import com.erp.model.Customer;
import com.erp.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {
    
    @Autowired
    private CustomerRepository customerRepository;
    
    public List<Customer> findAll() {
        return customerRepository.findAll();
    }
    
    public Optional<Customer> findById(Long id) {
        return customerRepository.findById(id);
    }
    
    public Customer save(Customer customer) {
        return customerRepository.save(customer);
    }
    
    public Customer update(Long id, Customer customer) {
        customer.setId(id);
        return customerRepository.save(customer);
    }
    
    public void delete(Long id) {
        customerRepository.deleteById(id);
    }
    
    public long count() {
        return customerRepository.count();
    }
}
