package com.erp.service;

import com.erp.model.PurchaseRequisition;
import com.erp.model.PurchaseRequisitionItem;
import com.erp.repository.PurchaseRequisitionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PurchaseRequisitionService {

    @Autowired
    private PurchaseRequisitionRepository prRepository;

    @Autowired
    private PrefixSettingsService prefixSettingsService;

    public List<PurchaseRequisition> getAll() {
        return prRepository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<PurchaseRequisition> getById(Long id) {
        return prRepository.findById(id);
    }

    public List<PurchaseRequisition> getByStatus(String status) {
        return prRepository.findByStatus(status);
    }

    @Transactional
    public PurchaseRequisition create(PurchaseRequisition pr) {
        if (pr.getPrNumber() == null || pr.getPrNumber().isEmpty()) {
            pr.setPrNumber(prefixSettingsService.generateNextId("pr"));
        }
        
        if (pr.getItems() != null) {
            for (PurchaseRequisitionItem item : pr.getItems()) {
                item.setPurchaseRequisition(pr);
                if (item.getFulfilledQuantity() == null) {
                    item.setFulfilledQuantity(0.0);
                }
                if (item.getStatus() == null) {
                    item.setStatus("Pending");
                }
            }
        }
        
        return prRepository.save(pr);
    }

    @Transactional
    public PurchaseRequisition update(Long id, PurchaseRequisition prDetails) {
        PurchaseRequisition pr = prRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("PR not found with id: " + id));
        
        if (!"Draft".equals(pr.getStatus())) {
            throw new RuntimeException("Only Draft PRs can be edited");
        }

        pr.setPrDate(prDetails.getPrDate());
        pr.setRequiredDate(prDetails.getRequiredDate());
        pr.setDepartment(prDetails.getDepartment());
        pr.setDeliveryLocation(prDetails.getDeliveryLocation());
        pr.setPurpose(prDetails.getPurpose());
        pr.setPriority(prDetails.getPriority());
        pr.setRemarks(prDetails.getRemarks());
        pr.setStatus(prDetails.getStatus());

        pr.getItems().clear();
        if (prDetails.getItems() != null) {
            for (PurchaseRequisitionItem item : prDetails.getItems()) {
                item.setPurchaseRequisition(pr);
                if (item.getFulfilledQuantity() == null) {
                    item.setFulfilledQuantity(0.0);
                }
                if (item.getStatus() == null) {
                    item.setStatus("Pending");
                }
                pr.getItems().add(item);
            }
        }

        return prRepository.save(pr);
    }

    @Transactional
    public void delete(Long id) {
        PurchaseRequisition pr = prRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("PR not found with id: " + id));
        
        if (!"Draft".equals(pr.getStatus())) {
            throw new RuntimeException("Only Draft PRs can be deleted");
        }
        
        prRepository.deleteById(id);
    }

    @Transactional
    public PurchaseRequisition submit(Long id, String submittedBy, Long submittedById) {
        PurchaseRequisition pr = prRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("PR not found with id: " + id));
        
        if (!"Draft".equals(pr.getStatus())) {
            throw new RuntimeException("Only Draft PRs can be submitted");
        }

        pr.setStatus("Submitted");
        pr.setSubmittedAt(LocalDateTime.now());
        pr.setSubmittedBy(submittedBy);
        pr.setSubmittedById(submittedById);

        return prRepository.save(pr);
    }

    @Transactional
    public PurchaseRequisition approve(Long id, String approvedBy, Long approvedById) {
        PurchaseRequisition pr = prRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("PR not found with id: " + id));
        
        if (!"Submitted".equals(pr.getStatus())) {
            throw new RuntimeException("Only Submitted PRs can be approved");
        }

        pr.setStatus("Approved");
        pr.setApprovedAt(LocalDateTime.now());
        pr.setApprovedBy(approvedBy);
        pr.setApprovedById(approvedById);

        return prRepository.save(pr);
    }

    @Transactional
    public PurchaseRequisition reject(Long id, String rejectedBy, Long rejectedById, String reason) {
        PurchaseRequisition pr = prRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("PR not found with id: " + id));
        
        if (!"Submitted".equals(pr.getStatus())) {
            throw new RuntimeException("Only Submitted PRs can be rejected");
        }

        pr.setStatus("Rejected");
        pr.setRejectedAt(LocalDateTime.now());
        pr.setRejectedBy(rejectedBy);
        pr.setRejectedById(rejectedById);
        pr.setRejectionReason(reason);

        return prRepository.save(pr);
    }

    @Transactional
    public PurchaseRequisition updateFulfillmentStatus(Long id) {
        PurchaseRequisition pr = prRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("PR not found with id: " + id));

        boolean allFulfilled = true;
        boolean anyFulfilled = false;

        for (PurchaseRequisitionItem item : pr.getItems()) {
            double fulfilled = item.getFulfilledQuantity() != null ? item.getFulfilledQuantity() : 0;
            double requested = item.getQuantity() != null ? item.getQuantity() : 0;

            if (fulfilled >= requested) {
                item.setStatus("Fully Fulfilled");
                anyFulfilled = true;
            } else if (fulfilled > 0) {
                item.setStatus("Partially Fulfilled");
                allFulfilled = false;
                anyFulfilled = true;
            } else {
                item.setStatus("Pending");
                allFulfilled = false;
            }
        }

        if (allFulfilled && !pr.getItems().isEmpty()) {
            pr.setStatus("Fully Fulfilled");
        } else if (anyFulfilled) {
            pr.setStatus("Partially Fulfilled");
        }

        return prRepository.save(pr);
    }
}
