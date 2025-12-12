package com.erp.service;

import com.erp.model.PRFulfillment;
import com.erp.model.PRFulfillmentItem;
import com.erp.model.PurchaseRequisition;
import com.erp.model.PurchaseRequisitionItem;
import com.erp.model.Item;
import com.erp.repository.PRFulfillmentRepository;
import com.erp.repository.PurchaseRequisitionRepository;
import com.erp.repository.PurchaseRequisitionItemRepository;
import com.erp.repository.ItemRepository;
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

    @Autowired
    private ItemRepository itemRepository;

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
        
        // Validate that all items have itemId before processing
        if (fulfillment.getItems() != null) {
            for (PRFulfillmentItem item : fulfillment.getItems()) {
                if (item.getFulfillQty() != null && item.getFulfillQty() > 0) {
                    // If itemId is missing, try to look it up from PR item
                    if (item.getItemId() == null && item.getPrItemId() != null) {
                        PurchaseRequisitionItem prItem = prItemRepository.findById(item.getPrItemId()).orElse(null);
                        if (prItem != null && prItem.getItemId() != null) {
                            item.setItemId(prItem.getItemId());
                            item.setItemCode(prItem.getItemCode());
                        }
                    }
                    
                    // Validate itemId is present for stock issue
                    if (item.getItemId() == null) {
                        throw new RuntimeException("Stock Issue requires inventory item reference. Item '" + item.getItemName() + "' is not linked to inventory.");
                    }
                    
                    // Validate sufficient stock is available
                    Item inventoryItem = itemRepository.findById(item.getItemId()).orElse(null);
                    if (inventoryItem == null) {
                        throw new RuntimeException("Inventory item not found for '" + item.getItemName() + "'");
                    }
                    
                    int currentStock = inventoryItem.getCurrentStock() != null ? inventoryItem.getCurrentStock() : 0;
                    int requestedQty = item.getFulfillQty().intValue();
                    if (requestedQty > currentStock) {
                        throw new RuntimeException("Insufficient stock for '" + item.getItemName() + "'. Available: " + currentStock + ", Requested: " + requestedQty);
                    }
                }
            }
        }
        
        PRFulfillment saved = createFulfillment(fulfillment);
        
        // Decrement inventory stock for each fulfilled item
        if (saved.getItems() != null) {
            for (PRFulfillmentItem item : saved.getItems()) {
                if (item.getItemId() != null && item.getFulfillQty() != null && item.getFulfillQty() > 0) {
                    Item inventoryItem = itemRepository.findById(item.getItemId()).orElse(null);
                    if (inventoryItem != null) {
                        int currentStock = inventoryItem.getCurrentStock() != null ? inventoryItem.getCurrentStock() : 0;
                        int newStock = currentStock - item.getFulfillQty().intValue();
                        inventoryItem.setCurrentStock(Math.max(0, newStock)); // Prevent negative stock
                        itemRepository.save(inventoryItem);
                    }
                }
            }
        }
        
        return saved;
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
