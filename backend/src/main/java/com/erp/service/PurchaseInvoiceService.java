package com.erp.service;

import com.erp.model.PurchaseInvoice;
import com.erp.model.PurchaseInvoiceItem;
import com.erp.repository.PurchaseInvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PurchaseInvoiceService {

    @Autowired
    private PurchaseInvoiceRepository invoiceRepository;

    public List<PurchaseInvoice> getAll() {
        return invoiceRepository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<PurchaseInvoice> getById(Long id) {
        return invoiceRepository.findById(id);
    }

    public List<PurchaseInvoice> getByStatus(String status) {
        return invoiceRepository.findByStatus(status);
    }

    public List<PurchaseInvoice> getByPoId(Long poId) {
        return invoiceRepository.findByPoId(poId);
    }

    @Transactional
    public PurchaseInvoice create(PurchaseInvoice invoice) {
        if (invoice.getInvoiceDate() == null) {
            invoice.setInvoiceDate(LocalDate.now());
        }
        
        List<PurchaseInvoiceItem> items = invoice.getItems();
        invoice.setItems(new ArrayList<>());
        
        if (items != null) {
            for (PurchaseInvoiceItem item : items) {
                item.setId(null);
                item.setPurchaseInvoice(invoice);
                invoice.getItems().add(item);
            }
        }
        
        calculateTotals(invoice);
        
        return invoiceRepository.save(invoice);
    }

    @Transactional
    public PurchaseInvoice update(Long id, PurchaseInvoice invoice) {
        PurchaseInvoice existing = invoiceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Invoice not found"));
        
        existing.setInvoiceNumber(invoice.getInvoiceNumber());
        existing.setPoId(invoice.getPoId());
        existing.setPoNumber(invoice.getPoNumber());
        existing.setInvoiceDate(invoice.getInvoiceDate());
        existing.setDueDate(invoice.getDueDate());
        existing.setSupplierId(invoice.getSupplierId());
        existing.setSupplierName(invoice.getSupplierName());
        existing.setSupplierAddress(invoice.getSupplierAddress());
        existing.setSupplierGstin(invoice.getSupplierGstin());
        existing.setSupplierContact(invoice.getSupplierContact());
        existing.setSupplierEmail(invoice.getSupplierEmail());
        existing.setBillToName(invoice.getBillToName());
        existing.setBillToAddress(invoice.getBillToAddress());
        existing.setBillToGstin(invoice.getBillToGstin());
        existing.setShipToName(invoice.getShipToName());
        existing.setShipToAddress(invoice.getShipToAddress());
        existing.setPaymentTerms(invoice.getPaymentTerms());
        existing.setDiscount(invoice.getDiscount());
        existing.setStatus(invoice.getStatus());
        existing.setRemarks(invoice.getRemarks());
        
        existing.getItems().clear();
        
        if (invoice.getItems() != null) {
            for (PurchaseInvoiceItem item : invoice.getItems()) {
                PurchaseInvoiceItem newItem = new PurchaseInvoiceItem();
                newItem.setItemCode(item.getItemCode());
                newItem.setItemName(item.getItemName());
                newItem.setDescription(item.getDescription());
                newItem.setHsnCode(item.getHsnCode());
                newItem.setQuantity(item.getQuantity());
                newItem.setUom(item.getUom());
                newItem.setRate(item.getRate());
                newItem.setTaxRate(item.getTaxRate());
                newItem.setTaxAmount(item.getTaxAmount());
                newItem.setAmount(item.getAmount());
                newItem.setRemarks(item.getRemarks());
                newItem.setPurchaseInvoice(existing);
                existing.getItems().add(newItem);
            }
        }
        
        calculateTotals(existing);
        
        return invoiceRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        invoiceRepository.deleteById(id);
    }

    @Transactional
    public PurchaseInvoice updateStatus(Long id, String status) {
        PurchaseInvoice invoice = invoiceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Invoice not found"));
        invoice.setStatus(status);
        return invoiceRepository.save(invoice);
    }

    private void calculateTotals(PurchaseInvoice invoice) {
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;
        
        if (invoice.getItems() != null) {
            for (PurchaseInvoiceItem item : invoice.getItems()) {
                BigDecimal rate = item.getRate() != null ? item.getRate().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
                Integer quantity = item.getQuantity() != null ? item.getQuantity() : 0;
                BigDecimal taxRate = item.getTaxRate() != null ? item.getTaxRate().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
                
                BigDecimal itemBase = rate.multiply(BigDecimal.valueOf(quantity)).setScale(2, RoundingMode.HALF_UP);
                BigDecimal itemTax = itemBase.multiply(taxRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                
                item.setTaxAmount(itemTax);
                item.setAmount(itemBase.add(itemTax).setScale(2, RoundingMode.HALF_UP));
                
                subtotal = subtotal.add(itemBase);
                totalTax = totalTax.add(itemTax);
            }
        }
        
        subtotal = subtotal.setScale(2, RoundingMode.HALF_UP);
        totalTax = totalTax.setScale(2, RoundingMode.HALF_UP);
        
        invoice.setSubtotal(subtotal);
        invoice.setTaxAmount(totalTax);
        
        BigDecimal discount = invoice.getDiscount() != null ? invoice.getDiscount().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        invoice.setTotalAmount(subtotal.add(totalTax).subtract(discount).setScale(2, RoundingMode.HALF_UP));
    }

    public String generateInvoiceNumber() {
        long count = invoiceRepository.count() + 1;
        return String.format("INV-%05d", count);
    }
}
