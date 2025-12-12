package com.erp.service;

import com.erp.model.PRFulfillment;
import com.erp.model.PRFulfillmentItem;
import com.erp.model.PurchaseRequisition;
import com.erp.model.PurchaseRequisitionItem;
import com.erp.repository.PRFulfillmentRepository;
import com.erp.repository.PurchaseRequisitionRepository;
import com.erp.repository.PurchaseRequisitionItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PRFulfillmentService {

    @Autowired
    private PRFulfillmentRepository fulfillmentRepository;

    @Autowired
    private PurchaseRequisitionRepository prRepository;

    @Autowired
    private PurchaseRequisitionItemRepository prItemRepository;

    @Autowired
    private PurchaseRequisitionService prService;

    @Autowired
    private PrefixSettingsService prefixSettingsService;

    public List<PRFulfillment> getByPrId(Long prId) {
        return fulfillmentRepository.findByPrId(prId);
    }

    public List<PRFulfillment> getAll() {
        return fulfillmentRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public PRFulfillment createPOFulfillment(PRFulfillment fulfillment) {
        if (fulfillment.getReferenceNumber() == null || fulfillment.getReferenceNumber().isEmpty()) {
            fulfillment.setReferenceNumber(prefixSettingsService.generateNextId("po"));
        }
        return createFulfillment(fulfillment);
    }

    @Transactional
    public PRFulfillment createStockIssueFulfillment(PRFulfillment fulfillment) {
        if (fulfillment.getReferenceNumber() == null || fulfillment.getReferenceNumber().isEmpty()) {
            fulfillment.setReferenceNumber(prefixSettingsService.generateNextId("issue"));
        }
        return createFulfillment(fulfillment);
    }

    @Transactional
    public PRFulfillment createMaterialTransferFulfillment(PRFulfillment fulfillment) {
        if (fulfillment.getReferenceNumber() == null || fulfillment.getReferenceNumber().isEmpty()) {
            fulfillment.setReferenceNumber(prefixSettingsService.generateNextId("transfer"));
        }
        return createFulfillment(fulfillment);
    }

    @Transactional
    public PRFulfillment createFulfillment(PRFulfillment fulfillment) {
        if (fulfillment.getItems() != null) {
            for (PRFulfillmentItem item : fulfillment.getItems()) {
                item.setPrFulfillment(fulfillment);
                
                if (item.getPrItemId() != null && item.getFulfillQty() != null && item.getFulfillQty() > 0) {
                    PurchaseRequisitionItem prItem = prItemRepository.findById(item.getPrItemId()).orElse(null);
                    if (prItem != null) {
                        double currentFulfilled = prItem.getFulfilledQuantity() != null ? prItem.getFulfilledQuantity() : 0;
                        prItem.setFulfilledQuantity(currentFulfilled + item.getFulfillQty());
                        prItemRepository.save(prItem);
                    }
                }
            }
        }
        
        PRFulfillment saved = fulfillmentRepository.save(fulfillment);
        
        if (fulfillment.getPrId() != null) {
            prService.updateFulfillmentStatus(fulfillment.getPrId());
        }
        
        return saved;
    }
}
