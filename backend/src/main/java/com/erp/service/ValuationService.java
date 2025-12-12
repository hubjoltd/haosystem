package com.erp.service;

import com.erp.model.*;
import com.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
public class ValuationService {
    
    public static class InsufficientInventoryException extends RuntimeException {
        private final Long itemId;
        private final Integer requested;
        private final Integer available;
        
        public InsufficientInventoryException(Long itemId, Integer requested, Integer available) {
            super("Insufficient inventory for item " + itemId + ": requested " + requested + ", available " + available);
            this.itemId = itemId;
            this.requested = requested;
            this.available = available;
        }
        
        public Long getItemId() { return itemId; }
        public Integer getRequested() { return requested; }
        public Integer getAvailable() { return available; }
    }
    
    @Autowired
    private ValuationCostLayerRepository costLayerRepository;
    
    @Autowired
    private GeneralSettingsRepository generalSettingsRepository;
    
    public static class ConsumptionResult {
        private BigDecimal totalCost;
        private BigDecimal unitCost;
        private List<LayerConsumption> consumptions;
        
        public ConsumptionResult() {
            this.totalCost = BigDecimal.ZERO;
            this.unitCost = BigDecimal.ZERO;
            this.consumptions = new ArrayList<>();
        }
        
        public BigDecimal getTotalCost() { return totalCost; }
        public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }
        public BigDecimal getUnitCost() { return unitCost; }
        public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost; }
        public List<LayerConsumption> getConsumptions() { return consumptions; }
        public void setConsumptions(List<LayerConsumption> consumptions) { this.consumptions = consumptions; }
    }
    
    public static class LayerConsumption {
        private Long layerId;
        private Integer quantityConsumed;
        private BigDecimal unitCost;
        private BigDecimal totalCost;
        
        public LayerConsumption(Long layerId, Integer quantityConsumed, BigDecimal unitCost) {
            this.layerId = layerId;
            this.quantityConsumed = quantityConsumed;
            this.unitCost = unitCost;
            this.totalCost = unitCost.multiply(BigDecimal.valueOf(quantityConsumed));
        }
        
        public Long getLayerId() { return layerId; }
        public Integer getQuantityConsumed() { return quantityConsumed; }
        public BigDecimal getUnitCost() { return unitCost; }
        public BigDecimal getTotalCost() { return totalCost; }
    }
    
    public String getValuationMethod() {
        GeneralSettings settings = generalSettingsRepository.findAll().stream().findFirst().orElse(null);
        return settings != null ? settings.getValuationMethod() : "FIFO";
    }
    
    @Transactional
    public ConsumptionResult consumeStock(Long itemId, Long warehouseId, Integer quantity) {
        String method = getValuationMethod();
        
        switch (method) {
            case "LIFO":
                return consumeStockLIFO(itemId, warehouseId, quantity);
            case "WEIGHTED_AVERAGE":
                return consumeStockWeightedAverage(itemId, warehouseId, quantity);
            case "FIFO":
            default:
                return consumeStockFIFO(itemId, warehouseId, quantity);
        }
    }
    
    @Transactional
    public ConsumptionResult consumeStockFIFO(Long itemId, Long warehouseId, Integer quantity) {
        List<ValuationCostLayer> layers;
        if (warehouseId != null) {
            layers = costLayerRepository.findByItemIdAndWarehouseIdAndQuantityRemainingGreaterThanOrderByCreatedAtAsc(itemId, warehouseId, 0);
        } else {
            layers = costLayerRepository.findByItemIdAndQuantityRemainingGreaterThanOrderByCreatedAtAsc(itemId, 0);
        }
        
        return consumeFromLayers(layers, quantity, itemId);
    }
    
    @Transactional
    public ConsumptionResult consumeStockLIFO(Long itemId, Long warehouseId, Integer quantity) {
        List<ValuationCostLayer> layers;
        if (warehouseId != null) {
            layers = costLayerRepository.findByItemIdAndWarehouseIdAndQuantityRemainingGreaterThanOrderByCreatedAtDesc(itemId, warehouseId, 0);
        } else {
            layers = costLayerRepository.findByItemIdAndQuantityRemainingGreaterThanOrderByCreatedAtDesc(itemId, 0);
        }
        
        return consumeFromLayers(layers, quantity, itemId);
    }
    
    @Transactional
    public ConsumptionResult consumeStockWeightedAverage(Long itemId, Long warehouseId, Integer quantity) {
        // Get layers and verify availability first
        List<ValuationCostLayer> layers;
        if (warehouseId != null) {
            layers = costLayerRepository.findByItemIdAndWarehouseIdAndQuantityRemainingGreaterThanOrderByCreatedAtAsc(itemId, warehouseId, 0);
        } else {
            layers = costLayerRepository.findByItemIdAndQuantityRemainingGreaterThanOrderByCreatedAtAsc(itemId, 0);
        }
        
        int totalAvailable = layers.stream()
            .mapToInt(l -> l.getQuantityRemaining() != null ? l.getQuantityRemaining() : 0)
            .sum();
        
        if (totalAvailable < quantity) {
            throw new InsufficientInventoryException(itemId, quantity, totalAvailable);
        }
        
        BigDecimal avgCost = getWeightedAverageCost(itemId, warehouseId);
        
        ConsumptionResult result = new ConsumptionResult();
        int actualConsumed = 0;
        
        int remainingQty = quantity;
        for (ValuationCostLayer layer : layers) {
            if (remainingQty <= 0) break;
            
            int available = layer.getQuantityRemaining();
            int toConsume = Math.min(available, remainingQty);
            
            layer.setQuantityRemaining(available - toConsume);
            costLayerRepository.save(layer);
            
            result.getConsumptions().add(new LayerConsumption(layer.getId(), toConsume, avgCost));
            remainingQty -= toConsume;
            actualConsumed += toConsume;
        }
        
        // Calculate totals based on actual consumed quantity
        result.setUnitCost(avgCost);
        result.setTotalCost(avgCost.multiply(BigDecimal.valueOf(actualConsumed)));
        
        return result;
    }
    
    private ConsumptionResult consumeFromLayers(List<ValuationCostLayer> layers, Integer quantity, Long itemId) {
        // First, verify we have enough inventory
        int totalAvailable = layers.stream()
            .mapToInt(l -> l.getQuantityRemaining() != null ? l.getQuantityRemaining() : 0)
            .sum();
        
        if (totalAvailable < quantity) {
            throw new InsufficientInventoryException(itemId, quantity, totalAvailable);
        }
        
        ConsumptionResult result = new ConsumptionResult();
        int remainingQty = quantity;
        BigDecimal totalCost = BigDecimal.ZERO;
        int actualConsumed = 0;
        
        for (ValuationCostLayer layer : layers) {
            if (remainingQty <= 0) break;
            
            int available = layer.getQuantityRemaining();
            int toConsume = Math.min(available, remainingQty);
            
            BigDecimal layerCost = layer.getUnitCost().multiply(BigDecimal.valueOf(toConsume));
            totalCost = totalCost.add(layerCost);
            
            layer.setQuantityRemaining(available - toConsume);
            costLayerRepository.save(layer);
            
            result.getConsumptions().add(new LayerConsumption(layer.getId(), toConsume, layer.getUnitCost()));
            remainingQty -= toConsume;
            actualConsumed += toConsume;
        }
        
        result.setTotalCost(totalCost);
        if (actualConsumed > 0) {
            result.setUnitCost(totalCost.divide(BigDecimal.valueOf(actualConsumed), 4, RoundingMode.HALF_UP));
        }
        
        return result;
    }
    
    public BigDecimal getWeightedAverageCost(Long itemId, Long warehouseId) {
        Integer totalQty;
        BigDecimal totalValue;
        
        if (warehouseId != null) {
            totalQty = costLayerRepository.getTotalQuantityByItemIdAndWarehouseId(itemId, warehouseId);
            totalValue = costLayerRepository.getTotalValueByItemIdAndWarehouseId(itemId, warehouseId);
        } else {
            totalQty = costLayerRepository.getTotalQuantityByItemId(itemId);
            totalValue = costLayerRepository.getTotalValueByItemId(itemId);
        }
        
        if (totalQty == null || totalQty == 0 || totalValue == null) {
            return BigDecimal.ZERO;
        }
        
        return totalValue.divide(BigDecimal.valueOf(totalQty), 4, RoundingMode.HALF_UP);
    }
    
    public BigDecimal getCurrentUnitCost(Long itemId, Long warehouseId) {
        String method = getValuationMethod();
        
        if ("WEIGHTED_AVERAGE".equals(method)) {
            return getWeightedAverageCost(itemId, warehouseId);
        }
        
        // For FIFO/LIFO, return the cost of the next layer to be consumed
        List<ValuationCostLayer> layers;
        if ("LIFO".equals(method)) {
            if (warehouseId != null) {
                layers = costLayerRepository.findByItemIdAndWarehouseIdAndQuantityRemainingGreaterThanOrderByCreatedAtDesc(itemId, warehouseId, 0);
            } else {
                layers = costLayerRepository.findByItemIdAndQuantityRemainingGreaterThanOrderByCreatedAtDesc(itemId, 0);
            }
        } else {
            if (warehouseId != null) {
                layers = costLayerRepository.findByItemIdAndWarehouseIdAndQuantityRemainingGreaterThanOrderByCreatedAtAsc(itemId, warehouseId, 0);
            } else {
                layers = costLayerRepository.findByItemIdAndQuantityRemainingGreaterThanOrderByCreatedAtAsc(itemId, 0);
            }
        }
        
        if (layers.isEmpty()) {
            return BigDecimal.ZERO;
        }
        
        return layers.get(0).getUnitCost();
    }
}
