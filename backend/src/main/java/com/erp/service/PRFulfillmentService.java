package com.erp.service;

import com.erp.model.*;
import com.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

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

    public List<PRFulfillment> getAllPOs() {
        return fulfillmentRepository.findAllPOsWithItems();
    }

    public Optional<PRFulfillment> getById(Long id) {
        return fulfillmentRepository.findByIdWithItems(id);
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

    @Autowired
    private PRStockFulfillmentRepository stockFulfillmentRepository;

    @Autowired
    private PRMaterialTransferRepository materialTransferRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    public List<PRStockFulfillment> getStockFulfillmentsByPrId(Long prId) {
        return stockFulfillmentRepository.findByPrIdWithItems(prId);
    }

    public List<PRMaterialTransfer> getMaterialTransfersByPrId(Long prId) {
        return materialTransferRepository.findByPrIdWithItems(prId);
    }

    public List<PRStockFulfillment> getAllStockFulfillments() {
        return stockFulfillmentRepository.findAll();
    }

    public List<PRMaterialTransfer> getAllMaterialTransfers() {
        return materialTransferRepository.findAll();
    }

    @Transactional
    public PRStockFulfillment createNewStockFulfillment(PRStockFulfillment fulfillment) {
        String prefix = "SF-";
        Integer maxNum = stockFulfillmentRepository.findMaxNumberByPrefix(prefix);
        int nextNum = (maxNum == null ? 0 : maxNum) + 1;
        fulfillment.setFulfillmentNumber(prefix + String.format("%05d", nextNum));
        
        if (fulfillment.getFulfillmentDate() == null) {
            fulfillment.setFulfillmentDate(LocalDate.now());
        }

        Long prId = fulfillment.getPrId();
        if (prId != null) {
            Optional<PurchaseRequisition> prOpt = prRepository.findById(prId);
            prOpt.ifPresent(pr -> {
                fulfillment.setPurchaseRequisition(pr);
                fulfillment.setPrNumber(pr.getPrNumber());
            });
        }

        Long warehouseId = fulfillment.getWarehouseId();
        if (warehouseId != null) {
            Optional<Warehouse> wh = warehouseRepository.findById(warehouseId);
            wh.ifPresent(w -> {
                fulfillment.setFromWarehouse(w);
                fulfillment.setFromWarehouseName(w.getName());
            });
        }

        Long supplierId = fulfillment.getSupplierId();
        if (supplierId != null) {
            Optional<Supplier> sup = supplierRepository.findById(supplierId);
            sup.ifPresent(s -> {
                fulfillment.setSupplier(s);
                fulfillment.setSupplierName(s.getName());
            });
        }

        if (fulfillment.getItems() == null || fulfillment.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stock fulfillment must have at least one item");
        }

        for (PRStockFulfillmentItem item : fulfillment.getItems()) {
            item.setStockFulfillment(fulfillment);
            
            if (item.getPrItemId() != null && item.getFulfilledQuantity() != null && item.getFulfilledQuantity() > 0) {
                PurchaseRequisitionItem prItem = prItemRepository.findById(item.getPrItemId()).orElse(null);
                if (prItem != null) {
                    item.setItemCode(prItem.getItemCode());
                    item.setItemName(prItem.getItemName());
                    item.setUom(prItem.getUom());
                    item.setRequestedQuantity((double) prItem.getQuantity());
                    
                    double currentFulfilled = prItem.getFulfilledQuantity() != null ? prItem.getFulfilledQuantity() : 0;
                    prItem.setFulfilledQuantity(currentFulfilled + item.getFulfilledQuantity());
                    
                    if (prItem.getFulfilledQuantity() >= prItem.getQuantity()) {
                        prItem.setStatus("Fully Fulfilled");
                    } else {
                        prItem.setStatus("Partially Fulfilled");
                    }
                    prItemRepository.save(prItem);
                }
            }
        }

        PRStockFulfillment saved = stockFulfillmentRepository.save(fulfillment);

        if (prId != null) {
            prService.updateFulfillmentStatus(prId);
        }

        return saved;
    }

    @Transactional
    public PRMaterialTransfer createNewMaterialTransfer(PRMaterialTransfer transfer) {
        String prefix = "MT-";
        Integer maxNum = materialTransferRepository.findMaxNumberByPrefix(prefix);
        int nextNum = (maxNum == null ? 0 : maxNum) + 1;
        transfer.setTransferNumber(prefix + String.format("%05d", nextNum));
        
        if (transfer.getTransferDate() == null) {
            transfer.setTransferDate(LocalDate.now());
        }

        Long prId = transfer.getPrId();
        if (prId != null) {
            Optional<PurchaseRequisition> prOpt = prRepository.findById(prId);
            prOpt.ifPresent(pr -> {
                transfer.setPurchaseRequisition(pr);
                transfer.setPrNumber(pr.getPrNumber());
            });
        }

        Long supplierId = transfer.getSupplierId();
        if (supplierId != null) {
            Optional<Supplier> sup = supplierRepository.findById(supplierId);
            sup.ifPresent(s -> {
                transfer.setSupplier(s);
                transfer.setSupplierName(s.getName());
            });
        }

        if (transfer.getItems() == null || transfer.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Material transfer must have at least one item");
        }

        for (PRMaterialTransferItem item : transfer.getItems()) {
            item.setMaterialTransfer(transfer);
            
            if (item.getPrItemId() != null && item.getTransferredQuantity() != null && item.getTransferredQuantity() > 0) {
                PurchaseRequisitionItem prItem = prItemRepository.findById(item.getPrItemId()).orElse(null);
                if (prItem != null) {
                    item.setItemCode(prItem.getItemCode());
                    item.setItemName(prItem.getItemName());
                    item.setUom(prItem.getUom());
                    item.setRequestedQuantity((double) prItem.getQuantity());
                    
                    double currentFulfilled = prItem.getFulfilledQuantity() != null ? prItem.getFulfilledQuantity() : 0;
                    prItem.setFulfilledQuantity(currentFulfilled + item.getTransferredQuantity());
                    
                    if (prItem.getFulfilledQuantity() >= prItem.getQuantity()) {
                        prItem.setStatus("Fully Fulfilled");
                    } else {
                        prItem.setStatus("Partially Fulfilled");
                    }
                    prItemRepository.save(prItem);
                }
            }
        }

        PRMaterialTransfer saved = materialTransferRepository.save(transfer);

        if (prId != null) {
            prService.updateFulfillmentStatus(prId);
        }

        return saved;
    }
}
