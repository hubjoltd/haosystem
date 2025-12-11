package com.erp.controller;

import com.erp.model.*;
import com.erp.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
public class ApiController {

    @Autowired
    private CustomerService customerService;
    
    @Autowired
    private ContractService contractService;
    
    @Autowired
    private ItemService itemService;
    
    @Autowired
    private ItemGroupService itemGroupService;
    
    @Autowired
    private UnitOfMeasureService unitOfMeasureService;
    
    @Autowired
    private WarehouseService warehouseService;
    
    @Autowired
    private BinService binService;
    
    @Autowired
    private SupplierService supplierService;
    
    @Autowired
    private GoodsReceiptService goodsReceiptService;
    
    @Autowired
    private GoodsIssueService goodsIssueService;
    
    @Autowired
    private StockTransferService stockTransferService;
    
    @Autowired
    private StockAdjustmentService stockAdjustmentService;
    
    @Autowired
    private InventoryLedgerService inventoryLedgerService;
    
    @Autowired
    private SettingsService settingsService;
    
    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "ERP API is running");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }

    @GetMapping("/customers")
    public ResponseEntity<List<Customer>> getCustomers() {
        return ResponseEntity.ok(customerService.findAll());
    }
    
    @GetMapping("/customers/{id}")
    public ResponseEntity<Customer> getCustomer(@PathVariable Long id) {
        return customerService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/customers")
    public ResponseEntity<Customer> createCustomer(@RequestBody Customer customer) {
        return ResponseEntity.ok(customerService.save(customer));
    }
    
    @PutMapping("/customers/{id}")
    public ResponseEntity<Customer> updateCustomer(@PathVariable Long id, @RequestBody Customer customer) {
        return ResponseEntity.ok(customerService.update(id, customer));
    }
    
    @DeleteMapping("/customers/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        customerService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/contracts")
    public ResponseEntity<List<Contract>> getContracts() {
        return ResponseEntity.ok(contractService.findAll());
    }
    
    @GetMapping("/contracts/{id}")
    public ResponseEntity<Contract> getContract(@PathVariable Long id) {
        return contractService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/contracts")
    public ResponseEntity<Contract> createContract(@RequestBody Contract contract) {
        return ResponseEntity.ok(contractService.save(contract));
    }
    
    @PutMapping("/contracts/{id}")
    public ResponseEntity<Contract> updateContract(@PathVariable Long id, @RequestBody Contract contract) {
        return ResponseEntity.ok(contractService.update(id, contract));
    }
    
    @DeleteMapping("/contracts/{id}")
    public ResponseEntity<Void> deleteContract(@PathVariable Long id) {
        contractService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/inventory/groups")
    public ResponseEntity<List<ItemGroup>> getGroups() {
        return ResponseEntity.ok(itemGroupService.findAll());
    }
    
    @GetMapping("/inventory/groups/{id}")
    public ResponseEntity<ItemGroup> getGroup(@PathVariable Long id) {
        return itemGroupService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/inventory/groups")
    public ResponseEntity<ItemGroup> createGroup(@RequestBody ItemGroup group) {
        return ResponseEntity.ok(itemGroupService.save(group));
    }
    
    @PutMapping("/inventory/groups/{id}")
    public ResponseEntity<ItemGroup> updateGroup(@PathVariable Long id, @RequestBody ItemGroup group) {
        return ResponseEntity.ok(itemGroupService.update(id, group));
    }
    
    @DeleteMapping("/inventory/groups/{id}")
    public ResponseEntity<Void> deleteGroup(@PathVariable Long id) {
        itemGroupService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/inventory/items")
    public ResponseEntity<List<Item>> getItems() {
        return ResponseEntity.ok(itemService.findAll());
    }
    
    @GetMapping("/inventory/items/{id}")
    public ResponseEntity<Item> getItem(@PathVariable Long id) {
        return itemService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/inventory/items")
    public ResponseEntity<Item> createItem(@RequestBody Item item) {
        return ResponseEntity.ok(itemService.save(item));
    }
    
    @PutMapping("/inventory/items/{id}")
    public ResponseEntity<Item> updateItem(@PathVariable Long id, @RequestBody Item item) {
        return ResponseEntity.ok(itemService.update(id, item));
    }
    
    @DeleteMapping("/inventory/items/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        itemService.delete(id);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/inventory/items/low-stock")
    public ResponseEntity<List<Item>> getLowStockItems() {
        return ResponseEntity.ok(itemService.findLowStockItems());
    }

    @GetMapping("/inventory/units")
    public ResponseEntity<List<UnitOfMeasure>> getUnits() {
        return ResponseEntity.ok(unitOfMeasureService.findAll());
    }
    
    @GetMapping("/inventory/units/{id}")
    public ResponseEntity<UnitOfMeasure> getUnit(@PathVariable Long id) {
        return unitOfMeasureService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/inventory/units")
    public ResponseEntity<UnitOfMeasure> createUnit(@RequestBody UnitOfMeasure unit) {
        return ResponseEntity.ok(unitOfMeasureService.save(unit));
    }
    
    @PutMapping("/inventory/units/{id}")
    public ResponseEntity<UnitOfMeasure> updateUnit(@PathVariable Long id, @RequestBody UnitOfMeasure unit) {
        return ResponseEntity.ok(unitOfMeasureService.update(id, unit));
    }
    
    @DeleteMapping("/inventory/units/{id}")
    public ResponseEntity<Void> deleteUnit(@PathVariable Long id) {
        unitOfMeasureService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/inventory/warehouses")
    public ResponseEntity<List<Warehouse>> getWarehouses() {
        return ResponseEntity.ok(warehouseService.findAll());
    }
    
    @GetMapping("/inventory/warehouses/{id}")
    public ResponseEntity<Warehouse> getWarehouse(@PathVariable Long id) {
        return warehouseService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/inventory/warehouses")
    public ResponseEntity<Warehouse> createWarehouse(@RequestBody Warehouse warehouse) {
        return ResponseEntity.ok(warehouseService.save(warehouse));
    }
    
    @PutMapping("/inventory/warehouses/{id}")
    public ResponseEntity<Warehouse> updateWarehouse(@PathVariable Long id, @RequestBody Warehouse warehouse) {
        return ResponseEntity.ok(warehouseService.update(id, warehouse));
    }
    
    @DeleteMapping("/inventory/warehouses/{id}")
    public ResponseEntity<Void> deleteWarehouse(@PathVariable Long id) {
        warehouseService.delete(id);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/inventory/bins")
    public ResponseEntity<List<Bin>> getBins() {
        return ResponseEntity.ok(binService.findAll());
    }
    
    @GetMapping("/inventory/bins/warehouse/{warehouseId}")
    public ResponseEntity<List<Bin>> getBinsByWarehouse(@PathVariable Long warehouseId) {
        return ResponseEntity.ok(binService.findByWarehouseId(warehouseId));
    }
    
    @GetMapping("/inventory/bins/{id}")
    public ResponseEntity<Bin> getBin(@PathVariable Long id) {
        return binService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/inventory/bins")
    public ResponseEntity<Bin> createBin(@RequestBody Bin bin) {
        return ResponseEntity.ok(binService.save(bin));
    }
    
    @PutMapping("/inventory/bins/{id}")
    public ResponseEntity<Bin> updateBin(@PathVariable Long id, @RequestBody Bin bin) {
        return ResponseEntity.ok(binService.update(id, bin));
    }
    
    @DeleteMapping("/inventory/bins/{id}")
    public ResponseEntity<Void> deleteBin(@PathVariable Long id) {
        binService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/inventory/suppliers")
    public ResponseEntity<List<Supplier>> getSuppliers() {
        return ResponseEntity.ok(supplierService.findAll());
    }
    
    @GetMapping("/inventory/suppliers/{id}")
    public ResponseEntity<Supplier> getSupplier(@PathVariable Long id) {
        return supplierService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/inventory/suppliers")
    public ResponseEntity<Supplier> createSupplier(@RequestBody Supplier supplier) {
        return ResponseEntity.ok(supplierService.save(supplier));
    }
    
    @PutMapping("/inventory/suppliers/{id}")
    public ResponseEntity<Supplier> updateSupplier(@PathVariable Long id, @RequestBody Supplier supplier) {
        return ResponseEntity.ok(supplierService.update(id, supplier));
    }
    
    @DeleteMapping("/inventory/suppliers/{id}")
    public ResponseEntity<Void> deleteSupplier(@PathVariable Long id) {
        supplierService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stock/grn")
    public ResponseEntity<List<GoodsReceipt>> getGRNs() {
        return ResponseEntity.ok(goodsReceiptService.findAll());
    }
    
    @GetMapping("/stock/grn/{id}")
    public ResponseEntity<GoodsReceipt> getGRN(@PathVariable Long id) {
        return goodsReceiptService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/stock/grn")
    public ResponseEntity<GoodsReceipt> createGRN(@RequestBody Map<String, Object> request) {
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/stock/grn/{id}")
    public ResponseEntity<Void> deleteGRN(@PathVariable Long id) {
        goodsReceiptService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stock/issues")
    public ResponseEntity<List<GoodsIssue>> getIssues() {
        return ResponseEntity.ok(goodsIssueService.findAll());
    }
    
    @GetMapping("/stock/issues/{id}")
    public ResponseEntity<GoodsIssue> getIssue(@PathVariable Long id) {
        return goodsIssueService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/stock/issues/{id}")
    public ResponseEntity<Void> deleteIssue(@PathVariable Long id) {
        goodsIssueService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stock/transfers")
    public ResponseEntity<List<StockTransfer>> getTransfers() {
        return ResponseEntity.ok(stockTransferService.findAll());
    }
    
    @GetMapping("/stock/transfers/{id}")
    public ResponseEntity<StockTransfer> getTransfer(@PathVariable Long id) {
        return stockTransferService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/stock/transfers/{id}")
    public ResponseEntity<Void> deleteTransfer(@PathVariable Long id) {
        stockTransferService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stock/adjustments")
    public ResponseEntity<List<StockAdjustment>> getAdjustments() {
        return ResponseEntity.ok(stockAdjustmentService.findAll());
    }
    
    @GetMapping("/stock/adjustments/{id}")
    public ResponseEntity<StockAdjustment> getAdjustment(@PathVariable Long id) {
        return stockAdjustmentService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/stock/adjustments/{id}")
    public ResponseEntity<Void> deleteAdjustment(@PathVariable Long id) {
        stockAdjustmentService.delete(id);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/inventory/ledger")
    public ResponseEntity<List<InventoryLedger>> getInventoryLedger() {
        return ResponseEntity.ok(inventoryLedgerService.findAll());
    }
    
    @GetMapping("/inventory/ledger/item/{itemId}")
    public ResponseEntity<List<InventoryLedger>> getInventoryLedgerByItem(@PathVariable Long itemId) {
        return ResponseEntity.ok(inventoryLedgerService.findByItemId(itemId));
    }

    @GetMapping("/settings/general")
    public ResponseEntity<GeneralSettings> getGeneralSettings() {
        return ResponseEntity.ok(settingsService.getGeneralSettings());
    }
    
    @PostMapping("/settings/general")
    public ResponseEntity<GeneralSettings> saveGeneralSettings(@RequestBody GeneralSettings settings) {
        return ResponseEntity.ok(settingsService.saveGeneralSettings(settings));
    }

    @GetMapping("/settings/finance")
    public ResponseEntity<FinanceSettings> getFinanceSettings() {
        return ResponseEntity.ok(settingsService.getFinanceSettings());
    }
    
    @PostMapping("/settings/finance")
    public ResponseEntity<FinanceSettings> saveFinanceSettings(@RequestBody FinanceSettings settings) {
        return ResponseEntity.ok(settingsService.saveFinanceSettings(settings));
    }

    @GetMapping("/settings/roles")
    public ResponseEntity<List<Object>> getRoles() {
        return ResponseEntity.ok(new ArrayList<>());
    }

    @GetMapping("/settings/staff")
    public ResponseEntity<List<Object>> getStaff() {
        return ResponseEntity.ok(new ArrayList<>());
    }
}
