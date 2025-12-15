package com.erp.repository;

import com.erp.model.PurchaseInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseInvoiceRepository extends JpaRepository<PurchaseInvoice, Long> {
    Optional<PurchaseInvoice> findByInvoiceNumber(String invoiceNumber);
    List<PurchaseInvoice> findByStatus(String status);
    List<PurchaseInvoice> findByPoId(Long poId);
    List<PurchaseInvoice> findBySupplierId(Long supplierId);
    List<PurchaseInvoice> findAllByOrderByCreatedAtDesc();
}
