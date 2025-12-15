package com.erp.controller;

import com.erp.model.PRFulfillment;
import com.erp.model.PRStockFulfillment;
import com.erp.model.PRMaterialTransfer;
import com.erp.service.PRFulfillmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchase/fulfillment")
@CrossOrigin(origins = "*")
public class PRFulfillmentController {

    @Autowired
    private PRFulfillmentService fulfillmentService;

    @GetMapping("/pr/{prId}")
    public ResponseEntity<List<PRFulfillment>> getByPrId(@PathVariable Long prId) {
        return ResponseEntity.ok(fulfillmentService.getByPrId(prId));
    }

    @GetMapping("/pr/{prId}/history")
    public ResponseEntity<List<PRFulfillment>> getFulfillmentHistory(@PathVariable Long prId) {
        return ResponseEntity.ok(fulfillmentService.getByPrId(prId));
    }

    @GetMapping
    public ResponseEntity<List<PRFulfillment>> getAll() {
        return ResponseEntity.ok(fulfillmentService.getAll());
    }

    @GetMapping("/pos")
    public ResponseEntity<List<PRFulfillment>> getAllPOs() {
        return ResponseEntity.ok(fulfillmentService.getAllPOs());
    }

    @GetMapping("/pos/{id}")
    public ResponseEntity<PRFulfillment> getPOById(@PathVariable Long id) {
        return fulfillmentService.getById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/convert-to-po")
    public ResponseEntity<PRFulfillment> createPOFulfillment(@RequestBody PRFulfillment fulfillment) {
        return ResponseEntity.ok(fulfillmentService.createPOFulfillment(fulfillment));
    }

    @PostMapping("/stock-issue")
    public ResponseEntity<PRFulfillment> createStockIssueFulfillment(@RequestBody PRFulfillment fulfillment) {
        return ResponseEntity.ok(fulfillmentService.createStockIssueFulfillment(fulfillment));
    }

    @PostMapping("/material-transfer")
    public ResponseEntity<PRFulfillment> createMaterialTransferFulfillment(@RequestBody PRFulfillment fulfillment) {
        return ResponseEntity.ok(fulfillmentService.createMaterialTransferFulfillment(fulfillment));
    }

    @GetMapping("/pr/{prId}/stock-fulfillments")
    public ResponseEntity<List<PRStockFulfillment>> getStockFulfillmentsByPrId(@PathVariable Long prId) {
        return ResponseEntity.ok(fulfillmentService.getStockFulfillmentsByPrId(prId));
    }

    @GetMapping("/pr/{prId}/material-transfers")
    public ResponseEntity<List<PRMaterialTransfer>> getMaterialTransfersByPrId(@PathVariable Long prId) {
        return ResponseEntity.ok(fulfillmentService.getMaterialTransfersByPrId(prId));
    }

    @GetMapping("/stock-fulfillments")
    public ResponseEntity<List<PRStockFulfillment>> getAllStockFulfillments() {
        return ResponseEntity.ok(fulfillmentService.getAllStockFulfillments());
    }

    @GetMapping("/material-transfers")
    public ResponseEntity<List<PRMaterialTransfer>> getAllMaterialTransfers() {
        return ResponseEntity.ok(fulfillmentService.getAllMaterialTransfers());
    }

    @PostMapping("/stock-fulfillment")
    public ResponseEntity<PRStockFulfillment> createStockFulfillment(@RequestBody PRStockFulfillment fulfillment) {
        return ResponseEntity.ok(fulfillmentService.createNewStockFulfillment(fulfillment));
    }

    @PostMapping("/material-transfer-new")
    public ResponseEntity<PRMaterialTransfer> createMaterialTransfer(@RequestBody PRMaterialTransfer transfer) {
        return ResponseEntity.ok(fulfillmentService.createNewMaterialTransfer(transfer));
    }
}
