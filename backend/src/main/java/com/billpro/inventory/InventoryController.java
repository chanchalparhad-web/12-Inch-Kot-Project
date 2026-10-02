package com.billpro.inventory;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getInventoryStatus(@RequestParam(defaultValue = "1") Long businessId) {
        return ResponseEntity.ok(inventoryService.getInventoryStatus(businessId));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<Map<String, Object>>> getLowStockItems(@RequestParam(defaultValue = "1") Long businessId) {
        return ResponseEntity.ok(inventoryService.getLowStockItems(businessId));
    }

    @PostMapping("/adjust")
    public ResponseEntity<Inventory> adjustStock(@Valid @RequestBody StockAdjustmentDto dto) {
        return ResponseEntity.ok(inventoryService.adjustStock(dto));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<InventoryTransaction>> getTransactions() {
        return ResponseEntity.ok(inventoryService.getTransactions());
    }
}
