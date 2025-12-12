package com.erp.controller;

import com.erp.model.*;
import com.erp.service.*;
import com.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/stock-movement")
@CrossOrigin(origins = "*")
public class StockMovementController {

    @Autowired
    private GoodsReceiptService goodsReceiptService;
    
    @Autowired
    private GoodsIssueService goodsIssueService;
    
    @Autowired
    private StockTransferService stockTransferService;
    
    @Autowired
    private StockAdjustmentService stockAdjustmentService;
    
    @Autowired
    private ItemRepository itemRepository;
    
    @Autowired
    private WarehouseRepository warehouseRepository;
    
    @Autowired
    private SupplierRepository supplierRepository;
    
    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private BinRepository binRepository;
    
    @Autowired
    private PrefixSettingsService prefixSettingsService;

    @GetMapping("/grn")
    public ResponseEntity<List<Map<String, Object>>> getGRNs() {
        List<GoodsReceipt> grns = goodsReceiptService.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (GoodsReceipt grn : grns) {
            Map<String, Object> grnMap = new HashMap<>();
            grnMap.put("id", grn.getId());
            grnMap.put("grnNumber", grn.getGrnNumber());
            grnMap.put("receiptDate", grn.getReceiptDate());
            grnMap.put("supplier", grn.getSupplier() != null ? grn.getSupplier().getName() : null);
            grnMap.put("supplierId", grn.getSupplier() != null ? grn.getSupplier().getId() : null);
            grnMap.put("warehouse", grn.getWarehouse() != null ? grn.getWarehouse().getName() : null);
            grnMap.put("warehouseId", grn.getWarehouse() != null ? grn.getWarehouse().getId() : null);
            grnMap.put("receiptType", grn.getReceiptType());
            grnMap.put("poNumber", grn.getPoNumber());
            grnMap.put("referenceNumber", grn.getReferenceNumber());
            grnMap.put("totalValue", grn.getTotalValue());
            grnMap.put("status", grn.getStatus());
            grnMap.put("remarks", grn.getRemarks());
            
            List<GoodsReceiptLine> lines = goodsReceiptService.findLinesByGrnId(grn.getId());
            List<Map<String, Object>> linesList = new ArrayList<>();
            for (GoodsReceiptLine line : lines) {
                Map<String, Object> lineMap = new HashMap<>();
                lineMap.put("id", line.getId());
                lineMap.put("itemId", line.getItem() != null ? line.getItem().getId() : null);
                lineMap.put("itemName", line.getItem() != null ? line.getItem().getName() : null);
                lineMap.put("itemCode", line.getItem() != null ? line.getItem().getCode() : null);
                lineMap.put("quantity", line.getQuantity());
                lineMap.put("unitPrice", line.getUnitPrice());
                lineMap.put("lineTotal", line.getLineTotal());
                lineMap.put("binId", line.getBin() != null ? line.getBin().getId() : null);
                lineMap.put("binName", line.getBin() != null ? line.getBin().getName() : null);
                linesList.add(lineMap);
            }
            grnMap.put("lines", linesList);
            result.add(grnMap);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/grn/{id}")
    public ResponseEntity<Map<String, Object>> getGRN(@PathVariable Long id) {
        return goodsReceiptService.findById(id)
            .map(grn -> {
                Map<String, Object> grnMap = new HashMap<>();
                grnMap.put("id", grn.getId());
                grnMap.put("grnNumber", grn.getGrnNumber());
                grnMap.put("receiptDate", grn.getReceiptDate());
                grnMap.put("supplier", grn.getSupplier() != null ? grn.getSupplier().getName() : null);
                grnMap.put("supplierId", grn.getSupplier() != null ? grn.getSupplier().getId() : null);
                grnMap.put("warehouse", grn.getWarehouse() != null ? grn.getWarehouse().getName() : null);
                grnMap.put("warehouseId", grn.getWarehouse() != null ? grn.getWarehouse().getId() : null);
                grnMap.put("receiptType", grn.getReceiptType());
                grnMap.put("poNumber", grn.getPoNumber());
                grnMap.put("referenceNumber", grn.getReferenceNumber());
                grnMap.put("totalValue", grn.getTotalValue());
                grnMap.put("status", grn.getStatus());
                grnMap.put("remarks", grn.getRemarks());
                
                List<GoodsReceiptLine> lines = goodsReceiptService.findLinesByGrnId(grn.getId());
                List<Map<String, Object>> linesList = new ArrayList<>();
                for (GoodsReceiptLine line : lines) {
                    Map<String, Object> lineMap = new HashMap<>();
                    lineMap.put("id", line.getId());
                    lineMap.put("itemId", line.getItem() != null ? line.getItem().getId() : null);
                    lineMap.put("itemName", line.getItem() != null ? line.getItem().getName() : null);
                    lineMap.put("itemCode", line.getItem() != null ? line.getItem().getCode() : null);
                    lineMap.put("quantity", line.getQuantity());
                    lineMap.put("unitPrice", line.getUnitPrice());
                    lineMap.put("lineTotal", line.getLineTotal());
                    lineMap.put("binId", line.getBin() != null ? line.getBin().getId() : null);
                    lineMap.put("binName", line.getBin() != null ? line.getBin().getName() : null);
                    linesList.add(lineMap);
                }
                grnMap.put("lines", linesList);
                return ResponseEntity.ok(grnMap);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/grn")
    public ResponseEntity<?> createGRN(@RequestBody Map<String, Object> request) {
        try {
            GoodsReceipt grn = new GoodsReceipt();
            grn.setGrnNumber(prefixSettingsService.generateNextId("grn"));
            
            if (request.get("receiptDate") != null) {
                grn.setReceiptDate(LocalDate.parse(request.get("receiptDate").toString()));
            } else {
                grn.setReceiptDate(LocalDate.now());
            }
            
            if (request.get("supplierId") != null) {
                Long supplierId = Long.valueOf(request.get("supplierId").toString());
                supplierRepository.findById(supplierId).ifPresent(grn::setSupplier);
            }
            
            if (request.get("warehouseId") != null) {
                Long warehouseId = Long.valueOf(request.get("warehouseId").toString());
                warehouseRepository.findById(warehouseId).ifPresent(grn::setWarehouse);
            }
            
            grn.setReceiptType(request.get("receiptType") != null ? request.get("receiptType").toString() : "DIRECT");
            grn.setPoNumber(request.get("poNumber") != null ? request.get("poNumber").toString() : null);
            grn.setReferenceNumber(request.get("referenceNumber") != null ? request.get("referenceNumber").toString() : null);
            grn.setRemarks(request.get("remarks") != null ? request.get("remarks").toString() : null);
            grn.setStatus("Completed");
            
            List<GoodsReceiptLine> lines = new ArrayList<>();
            if (request.get("lines") != null) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> lineData = (List<Map<String, Object>>) request.get("lines");
                for (Map<String, Object> lineItem : lineData) {
                    GoodsReceiptLine line = new GoodsReceiptLine();
                    
                    if (lineItem.get("itemId") != null) {
                        Long itemId = Long.valueOf(lineItem.get("itemId").toString());
                        itemRepository.findById(itemId).ifPresent(line::setItem);
                    }
                    
                    if (lineItem.get("binId") != null) {
                        Long binId = Long.valueOf(lineItem.get("binId").toString());
                        binRepository.findById(binId).ifPresent(line::setBin);
                    }
                    
                    line.setQuantity(lineItem.get("quantity") != null ? 
                        Integer.valueOf(lineItem.get("quantity").toString()) : 0);
                    line.setUnitPrice(lineItem.get("unitPrice") != null ? 
                        new BigDecimal(lineItem.get("unitPrice").toString()) : BigDecimal.ZERO);
                    
                    if (line.getItem() != null && line.getQuantity() > 0) {
                        lines.add(line);
                    }
                }
            }
            
            if (lines.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "At least one valid line item is required"));
            }
            
            GoodsReceipt saved = goodsReceiptService.save(grn, lines);
            return ResponseEntity.ok(Map.of("id", saved.getId(), "grnNumber", saved.getGrnNumber()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/grn/{id}")
    public ResponseEntity<Void> deleteGRN(@PathVariable Long id) {
        goodsReceiptService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/issues")
    public ResponseEntity<List<Map<String, Object>>> getIssues() {
        List<GoodsIssue> issues = goodsIssueService.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (GoodsIssue issue : issues) {
            Map<String, Object> issueMap = new HashMap<>();
            issueMap.put("id", issue.getId());
            issueMap.put("issueNumber", issue.getIssueNumber());
            issueMap.put("issueDate", issue.getIssueDate());
            issueMap.put("customer", issue.getCustomer() != null ? issue.getCustomer().getName() : null);
            issueMap.put("customerId", issue.getCustomer() != null ? issue.getCustomer().getId() : null);
            issueMap.put("warehouse", issue.getWarehouse() != null ? issue.getWarehouse().getName() : null);
            issueMap.put("warehouseId", issue.getWarehouse() != null ? issue.getWarehouse().getId() : null);
            issueMap.put("referenceNumber", issue.getReferenceNumber());
            issueMap.put("totalValue", issue.getTotalValue());
            issueMap.put("status", issue.getStatus());
            issueMap.put("remarks", issue.getRemarks());
            
            List<GoodsIssueLine> lines = goodsIssueService.findLinesByIssueId(issue.getId());
            List<Map<String, Object>> linesList = new ArrayList<>();
            for (GoodsIssueLine line : lines) {
                Map<String, Object> lineMap = new HashMap<>();
                lineMap.put("id", line.getId());
                lineMap.put("itemId", line.getItem() != null ? line.getItem().getId() : null);
                lineMap.put("itemName", line.getItem() != null ? line.getItem().getName() : null);
                lineMap.put("itemCode", line.getItem() != null ? line.getItem().getCode() : null);
                lineMap.put("quantity", line.getQuantity());
                lineMap.put("unitPrice", line.getUnitPrice());
                lineMap.put("lineTotal", line.getLineTotal());
                lineMap.put("binId", line.getBin() != null ? line.getBin().getId() : null);
                lineMap.put("binName", line.getBin() != null ? line.getBin().getName() : null);
                linesList.add(lineMap);
            }
            issueMap.put("lines", linesList);
            result.add(issueMap);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/issues/{id}")
    public ResponseEntity<Map<String, Object>> getIssue(@PathVariable Long id) {
        return goodsIssueService.findById(id)
            .map(issue -> {
                Map<String, Object> issueMap = new HashMap<>();
                issueMap.put("id", issue.getId());
                issueMap.put("issueNumber", issue.getIssueNumber());
                issueMap.put("issueDate", issue.getIssueDate());
                issueMap.put("customer", issue.getCustomer() != null ? issue.getCustomer().getName() : null);
                issueMap.put("customerId", issue.getCustomer() != null ? issue.getCustomer().getId() : null);
                issueMap.put("warehouse", issue.getWarehouse() != null ? issue.getWarehouse().getName() : null);
                issueMap.put("warehouseId", issue.getWarehouse() != null ? issue.getWarehouse().getId() : null);
                issueMap.put("referenceNumber", issue.getReferenceNumber());
                issueMap.put("totalValue", issue.getTotalValue());
                issueMap.put("status", issue.getStatus());
                issueMap.put("remarks", issue.getRemarks());
                
                List<GoodsIssueLine> lines = goodsIssueService.findLinesByIssueId(issue.getId());
                List<Map<String, Object>> linesList = new ArrayList<>();
                for (GoodsIssueLine line : lines) {
                    Map<String, Object> lineMap = new HashMap<>();
                    lineMap.put("id", line.getId());
                    lineMap.put("itemId", line.getItem() != null ? line.getItem().getId() : null);
                    lineMap.put("itemName", line.getItem() != null ? line.getItem().getName() : null);
                    lineMap.put("itemCode", line.getItem() != null ? line.getItem().getCode() : null);
                    lineMap.put("quantity", line.getQuantity());
                    lineMap.put("unitPrice", line.getUnitPrice());
                    lineMap.put("lineTotal", line.getLineTotal());
                    lineMap.put("binId", line.getBin() != null ? line.getBin().getId() : null);
                    lineMap.put("binName", line.getBin() != null ? line.getBin().getName() : null);
                    linesList.add(lineMap);
                }
                issueMap.put("lines", linesList);
                return ResponseEntity.ok(issueMap);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/issues")
    public ResponseEntity<?> createIssue(@RequestBody Map<String, Object> request) {
        try {
            GoodsIssue issue = new GoodsIssue();
            issue.setIssueNumber(prefixSettingsService.generateNextId("issue"));
            
            if (request.get("issueDate") != null) {
                issue.setIssueDate(LocalDate.parse(request.get("issueDate").toString()));
            } else {
                issue.setIssueDate(LocalDate.now());
            }
            
            if (request.get("customerId") != null) {
                Long customerId = Long.valueOf(request.get("customerId").toString());
                customerRepository.findById(customerId).ifPresent(issue::setCustomer);
            }
            
            if (request.get("warehouseId") != null) {
                Long warehouseId = Long.valueOf(request.get("warehouseId").toString());
                warehouseRepository.findById(warehouseId).ifPresent(issue::setWarehouse);
            }
            
            issue.setReferenceNumber(request.get("referenceNumber") != null ? request.get("referenceNumber").toString() : null);
            issue.setRemarks(request.get("remarks") != null ? request.get("remarks").toString() : null);
            issue.setStatus("Completed");
            
            String issueType = request.get("issueType") != null ? request.get("issueType").toString() : "Manual";
            boolean allowNegativeStock = "true".equals(String.valueOf(request.get("allowNegativeStock")));
            
            List<GoodsIssueLine> lines = new ArrayList<>();
            if (request.get("lines") != null) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> lineData = (List<Map<String, Object>>) request.get("lines");
                for (Map<String, Object> lineItem : lineData) {
                    GoodsIssueLine line = new GoodsIssueLine();
                    
                    if (lineItem.get("itemId") != null) {
                        Long itemId = Long.valueOf(lineItem.get("itemId").toString());
                        Item item = itemRepository.findById(itemId).orElse(null);
                        if (item != null) {
                            line.setItem(item);
                            
                            int quantity = lineItem.get("quantity") != null ? 
                                Integer.valueOf(lineItem.get("quantity").toString()) : 0;
                            int currentStock = item.getCurrentStock() != null ? item.getCurrentStock() : 0;
                            
                            if (!allowNegativeStock && quantity > currentStock) {
                                return ResponseEntity.badRequest().body(Map.of(
                                    "error", "Insufficient stock for item: " + item.getName() + 
                                    ". Available: " + currentStock + ", Requested: " + quantity
                                ));
                            }
                            
                            line.setQuantity(quantity);
                        }
                    }
                    
                    if (lineItem.get("binId") != null) {
                        Long binId = Long.valueOf(lineItem.get("binId").toString());
                        binRepository.findById(binId).ifPresent(line::setBin);
                    }
                    
                    line.setUnitPrice(lineItem.get("unitPrice") != null ? 
                        new BigDecimal(lineItem.get("unitPrice").toString()) : BigDecimal.ZERO);
                    
                    if (line.getItem() != null && line.getQuantity() > 0) {
                        lines.add(line);
                    }
                }
            }
            
            if (lines.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "At least one valid line item is required"));
            }
            
            GoodsIssue saved = goodsIssueService.save(issue, lines);
            return ResponseEntity.ok(Map.of("id", saved.getId(), "issueNumber", saved.getIssueNumber()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/issues/{id}")
    public ResponseEntity<Void> deleteIssue(@PathVariable Long id) {
        goodsIssueService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/transfers")
    public ResponseEntity<List<Map<String, Object>>> getTransfers() {
        List<StockTransfer> transfers = stockTransferService.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (StockTransfer transfer : transfers) {
            Map<String, Object> transferMap = new HashMap<>();
            transferMap.put("id", transfer.getId());
            transferMap.put("transferNumber", transfer.getTransferNumber());
            transferMap.put("transferDate", transfer.getTransferDate());
            transferMap.put("fromWarehouse", transfer.getFromWarehouse() != null ? transfer.getFromWarehouse().getName() : null);
            transferMap.put("fromWarehouseId", transfer.getFromWarehouse() != null ? transfer.getFromWarehouse().getId() : null);
            transferMap.put("toWarehouse", transfer.getToWarehouse() != null ? transfer.getToWarehouse().getName() : null);
            transferMap.put("toWarehouseId", transfer.getToWarehouse() != null ? transfer.getToWarehouse().getId() : null);
            transferMap.put("status", transfer.getStatus());
            transferMap.put("remarks", transfer.getRemarks());
            
            List<StockTransferLine> lines = stockTransferService.findLinesByTransferId(transfer.getId());
            List<Map<String, Object>> linesList = new ArrayList<>();
            for (StockTransferLine line : lines) {
                Map<String, Object> lineMap = new HashMap<>();
                lineMap.put("id", line.getId());
                lineMap.put("itemId", line.getItem() != null ? line.getItem().getId() : null);
                lineMap.put("itemName", line.getItem() != null ? line.getItem().getName() : null);
                lineMap.put("itemCode", line.getItem() != null ? line.getItem().getCode() : null);
                lineMap.put("quantity", line.getQuantity());
                lineMap.put("fromBinId", line.getFromBin() != null ? line.getFromBin().getId() : null);
                lineMap.put("fromBinName", line.getFromBin() != null ? line.getFromBin().getName() : null);
                lineMap.put("toBinId", line.getToBin() != null ? line.getToBin().getId() : null);
                lineMap.put("toBinName", line.getToBin() != null ? line.getToBin().getName() : null);
                linesList.add(lineMap);
            }
            transferMap.put("lines", linesList);
            result.add(transferMap);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/transfers/{id}")
    public ResponseEntity<Map<String, Object>> getTransfer(@PathVariable Long id) {
        return stockTransferService.findById(id)
            .map(transfer -> {
                Map<String, Object> transferMap = new HashMap<>();
                transferMap.put("id", transfer.getId());
                transferMap.put("transferNumber", transfer.getTransferNumber());
                transferMap.put("transferDate", transfer.getTransferDate());
                transferMap.put("fromWarehouse", transfer.getFromWarehouse() != null ? transfer.getFromWarehouse().getName() : null);
                transferMap.put("fromWarehouseId", transfer.getFromWarehouse() != null ? transfer.getFromWarehouse().getId() : null);
                transferMap.put("toWarehouse", transfer.getToWarehouse() != null ? transfer.getToWarehouse().getName() : null);
                transferMap.put("toWarehouseId", transfer.getToWarehouse() != null ? transfer.getToWarehouse().getId() : null);
                transferMap.put("status", transfer.getStatus());
                transferMap.put("remarks", transfer.getRemarks());
                
                List<StockTransferLine> lines = stockTransferService.findLinesByTransferId(transfer.getId());
                List<Map<String, Object>> linesList = new ArrayList<>();
                for (StockTransferLine line : lines) {
                    Map<String, Object> lineMap = new HashMap<>();
                    lineMap.put("id", line.getId());
                    lineMap.put("itemId", line.getItem() != null ? line.getItem().getId() : null);
                    lineMap.put("itemName", line.getItem() != null ? line.getItem().getName() : null);
                    lineMap.put("itemCode", line.getItem() != null ? line.getItem().getCode() : null);
                    lineMap.put("quantity", line.getQuantity());
                    lineMap.put("fromBinId", line.getFromBin() != null ? line.getFromBin().getId() : null);
                    lineMap.put("fromBinName", line.getFromBin() != null ? line.getFromBin().getName() : null);
                    lineMap.put("toBinId", line.getToBin() != null ? line.getToBin().getId() : null);
                    lineMap.put("toBinName", line.getToBin() != null ? line.getToBin().getName() : null);
                    linesList.add(lineMap);
                }
                transferMap.put("lines", linesList);
                return ResponseEntity.ok(transferMap);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/transfers")
    public ResponseEntity<?> createTransfer(@RequestBody Map<String, Object> request) {
        try {
            StockTransfer transfer = new StockTransfer();
            transfer.setTransferNumber(prefixSettingsService.generateNextId("transfer"));
            
            if (request.get("transferDate") != null) {
                transfer.setTransferDate(LocalDate.parse(request.get("transferDate").toString()));
            } else {
                transfer.setTransferDate(LocalDate.now());
            }
            
            if (request.get("fromWarehouseId") != null) {
                Long fromWarehouseId = Long.valueOf(request.get("fromWarehouseId").toString());
                warehouseRepository.findById(fromWarehouseId).ifPresent(transfer::setFromWarehouse);
            }
            
            if (request.get("toWarehouseId") != null) {
                Long toWarehouseId = Long.valueOf(request.get("toWarehouseId").toString());
                warehouseRepository.findById(toWarehouseId).ifPresent(transfer::setToWarehouse);
            }
            
            transfer.setRemarks(request.get("remarks") != null ? request.get("remarks").toString() : null);
            transfer.setStatus("Completed");
            
            List<StockTransferLine> lines = new ArrayList<>();
            if (request.get("lines") != null) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> lineData = (List<Map<String, Object>>) request.get("lines");
                for (Map<String, Object> lineItem : lineData) {
                    StockTransferLine line = new StockTransferLine();
                    
                    if (lineItem.get("itemId") != null) {
                        Long itemId = Long.valueOf(lineItem.get("itemId").toString());
                        itemRepository.findById(itemId).ifPresent(line::setItem);
                    }
                    
                    if (lineItem.get("fromBinId") != null) {
                        Long fromBinId = Long.valueOf(lineItem.get("fromBinId").toString());
                        binRepository.findById(fromBinId).ifPresent(line::setFromBin);
                    }
                    
                    if (lineItem.get("toBinId") != null) {
                        Long toBinId = Long.valueOf(lineItem.get("toBinId").toString());
                        binRepository.findById(toBinId).ifPresent(line::setToBin);
                    }
                    
                    line.setQuantity(lineItem.get("quantity") != null ? 
                        Integer.valueOf(lineItem.get("quantity").toString()) : 0);
                    
                    if (line.getItem() != null && line.getQuantity() > 0) {
                        lines.add(line);
                    }
                }
            }
            
            if (lines.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "At least one valid line item is required"));
            }
            
            StockTransfer saved = stockTransferService.save(transfer, lines);
            return ResponseEntity.ok(Map.of("id", saved.getId(), "transferNumber", saved.getTransferNumber()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/transfers/{id}")
    public ResponseEntity<Void> deleteTransfer(@PathVariable Long id) {
        stockTransferService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/adjustments")
    public ResponseEntity<List<Map<String, Object>>> getAdjustments() {
        List<StockAdjustment> adjustments = stockAdjustmentService.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (StockAdjustment adj : adjustments) {
            Map<String, Object> adjMap = new HashMap<>();
            adjMap.put("id", adj.getId());
            adjMap.put("adjustmentNumber", adj.getAdjustmentNumber());
            adjMap.put("adjustmentDate", adj.getAdjustmentDate());
            adjMap.put("adjustmentType", adj.getAdjustmentType());
            adjMap.put("item", adj.getItem() != null ? adj.getItem().getName() : null);
            adjMap.put("itemId", adj.getItem() != null ? adj.getItem().getId() : null);
            adjMap.put("itemCode", adj.getItem() != null ? adj.getItem().getCode() : null);
            adjMap.put("warehouse", adj.getWarehouse() != null ? adj.getWarehouse().getName() : null);
            adjMap.put("warehouseId", adj.getWarehouse() != null ? adj.getWarehouse().getId() : null);
            adjMap.put("bin", adj.getBin() != null ? adj.getBin().getName() : null);
            adjMap.put("binId", adj.getBin() != null ? adj.getBin().getId() : null);
            adjMap.put("quantityBefore", adj.getQuantityBefore());
            adjMap.put("quantityAdjusted", adj.getQuantityAdjusted());
            adjMap.put("quantityAfter", adj.getQuantityAfter());
            adjMap.put("valueDifference", adj.getValueDifference());
            adjMap.put("reason", adj.getReason());
            adjMap.put("status", adj.getStatus());
            result.add(adjMap);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/adjustments/{id}")
    public ResponseEntity<Map<String, Object>> getAdjustment(@PathVariable Long id) {
        return stockAdjustmentService.findById(id)
            .map(adj -> {
                Map<String, Object> adjMap = new HashMap<>();
                adjMap.put("id", adj.getId());
                adjMap.put("adjustmentNumber", adj.getAdjustmentNumber());
                adjMap.put("adjustmentDate", adj.getAdjustmentDate());
                adjMap.put("adjustmentType", adj.getAdjustmentType());
                adjMap.put("item", adj.getItem() != null ? adj.getItem().getName() : null);
                adjMap.put("itemId", adj.getItem() != null ? adj.getItem().getId() : null);
                adjMap.put("itemCode", adj.getItem() != null ? adj.getItem().getCode() : null);
                adjMap.put("warehouse", adj.getWarehouse() != null ? adj.getWarehouse().getName() : null);
                adjMap.put("warehouseId", adj.getWarehouse() != null ? adj.getWarehouse().getId() : null);
                adjMap.put("bin", adj.getBin() != null ? adj.getBin().getName() : null);
                adjMap.put("binId", adj.getBin() != null ? adj.getBin().getId() : null);
                adjMap.put("quantityBefore", adj.getQuantityBefore());
                adjMap.put("quantityAdjusted", adj.getQuantityAdjusted());
                adjMap.put("quantityAfter", adj.getQuantityAfter());
                adjMap.put("valueDifference", adj.getValueDifference());
                adjMap.put("reason", adj.getReason());
                adjMap.put("status", adj.getStatus());
                return ResponseEntity.ok(adjMap);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/adjustments")
    public ResponseEntity<?> createAdjustment(@RequestBody Map<String, Object> request) {
        try {
            StockAdjustment adjustment = new StockAdjustment();
            adjustment.setAdjustmentNumber(prefixSettingsService.generateNextId("adjustment"));
            
            if (request.get("adjustmentDate") != null) {
                adjustment.setAdjustmentDate(LocalDate.parse(request.get("adjustmentDate").toString()));
            } else {
                adjustment.setAdjustmentDate(LocalDate.now());
            }
            
            if (request.get("itemId") != null) {
                Long itemId = Long.valueOf(request.get("itemId").toString());
                Item item = itemRepository.findById(itemId).orElse(null);
                if (item == null) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Item not found"));
                }
                adjustment.setItem(item);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Item is required"));
            }
            
            if (request.get("warehouseId") != null) {
                Long warehouseId = Long.valueOf(request.get("warehouseId").toString());
                warehouseRepository.findById(warehouseId).ifPresent(adjustment::setWarehouse);
            }
            
            if (request.get("binId") != null) {
                Long binId = Long.valueOf(request.get("binId").toString());
                binRepository.findById(binId).ifPresent(adjustment::setBin);
            }
            
            String adjustmentType = request.get("adjustmentType") != null ? 
                request.get("adjustmentType").toString().toUpperCase() : "INCREASE";
            adjustment.setAdjustmentType(adjustmentType);
            
            Integer quantityAdjusted = request.get("quantityAdjusted") != null ? 
                Integer.valueOf(request.get("quantityAdjusted").toString()) : 0;
            if (quantityAdjusted <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Quantity must be greater than 0"));
            }
            adjustment.setQuantityAdjusted(quantityAdjusted);
            
            String reason = request.get("reason") != null ? request.get("reason").toString() : null;
            if (reason == null || reason.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Reason is required for stock adjustment"));
            }
            adjustment.setReason(reason);
            
            adjustment.setStatus("Pending");
            
            Item item = adjustment.getItem();
            int currentStock = item.getCurrentStock() != null ? item.getCurrentStock() : 0;
            adjustment.setQuantityBefore(currentStock);
            
            int estimatedAfter;
            if ("INCREASE".equals(adjustmentType)) {
                estimatedAfter = currentStock + quantityAdjusted;
            } else {
                estimatedAfter = currentStock - quantityAdjusted;
            }
            adjustment.setQuantityAfter(estimatedAfter);
            
            StockAdjustment saved = stockAdjustmentService.saveWithoutStockUpdate(adjustment);
            return ResponseEntity.ok(Map.of(
                "id", saved.getId(), 
                "adjustmentNumber", saved.getAdjustmentNumber(),
                "quantityBefore", currentStock,
                "quantityAfter", estimatedAfter
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/adjustments/{id}")
    public ResponseEntity<Void> deleteAdjustment(@PathVariable Long id) {
        stockAdjustmentService.delete(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/adjustments/{id}/approve")
    public ResponseEntity<?> approveAdjustment(@PathVariable Long id) {
        try {
            StockAdjustment adjustment = stockAdjustmentService.findById(id)
                .orElseThrow(() -> new RuntimeException("Adjustment not found"));
            
            if (!"Pending".equals(adjustment.getStatus())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Only pending adjustments can be approved"));
            }
            
            adjustment.setStatus("Approved");
            StockAdjustment saved = stockAdjustmentService.save(adjustment);
            
            return ResponseEntity.ok(Map.of(
                "id", saved.getId(),
                "status", saved.getStatus(),
                "quantityAfter", saved.getQuantityAfter()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/adjustments/{id}/reject")
    public ResponseEntity<?> rejectAdjustment(@PathVariable Long id) {
        try {
            StockAdjustment adjustment = stockAdjustmentService.findById(id)
                .orElseThrow(() -> new RuntimeException("Adjustment not found"));
            
            if (!"Pending".equals(adjustment.getStatus())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Only pending adjustments can be rejected"));
            }
            
            adjustment.setStatus("Rejected");
            stockAdjustmentService.saveWithoutStockUpdate(adjustment);
            
            return ResponseEntity.ok(Map.of("id", adjustment.getId(), "status", "Rejected"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
