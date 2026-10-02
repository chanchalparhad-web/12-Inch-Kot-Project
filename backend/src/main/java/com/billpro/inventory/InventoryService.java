package com.billpro.inventory;

import com.billpro.exception.ResourceNotFoundException;
import com.billpro.product.Product;
import com.billpro.product.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final ProductRepository productRepository;

    public InventoryService(InventoryRepository inventoryRepository,
                            InventoryTransactionRepository transactionRepository,
                            ProductRepository productRepository) {
        this.inventoryRepository = inventoryRepository;
        this.transactionRepository = transactionRepository;
        this.productRepository = productRepository;
    }

    public List<Map<String, Object>> getInventoryStatus(Long businessId) {
        List<Product> products = productRepository.findByBusinessIdAndActiveTrue(businessId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Product p : products) {
            Inventory inv = inventoryRepository.findByProductId(p.getId())
                    .orElse(Inventory.builder().productId(p.getId()).currentStock(0).build());

            Map<String, Object> map = new HashMap<>();
            map.put("productId", p.getId());
            map.put("productName", p.getName());
            map.put("sku", p.getSku());
            map.put("unit", p.getUnit());
            map.put("lowStockThreshold", p.getLowStockThreshold());
            map.put("currentStock", inv.getCurrentStock());

            String status = "OK";
            if (inv.getCurrentStock() == 0) {
                status = "OUT_OF_STOCK";
            } else if (inv.getCurrentStock() <= p.getLowStockThreshold()) {
                status = "LOW";
            }
            map.put("status", status);

            result.add(map);
        }
        return result;
    }

    public List<Map<String, Object>> getLowStockItems(Long businessId) {
        List<Map<String, Object>> all = getInventoryStatus(businessId);
        List<Map<String, Object>> low = new ArrayList<>();
        for (Map<String, Object> item : all) {
            String status = (String) item.get("status");
            if ("LOW".equals(status) || "OUT_OF_STOCK".equals(status)) {
                low.add(item);
            }
        }
        return low;
    }

    @Transactional
    public Inventory adjustStock(StockAdjustmentDto dto) {
        Product p = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + dto.getProductId()));

        Inventory inv = inventoryRepository.findByProductId(dto.getProductId())
                .orElseGet(() -> inventoryRepository.save(Inventory.builder().productId(p.getId()).currentStock(0).build()));

        int newStock = Math.max(0, inv.getCurrentStock() + dto.getQuantity());
        inv.setCurrentStock(newStock);
        Inventory saved = inventoryRepository.save(inv);

        // Record audit transaction
        InventoryTransaction txn = InventoryTransaction.builder()
                .productId(p.getId())
                .type(dto.getType() != null ? dto.getType() : "CORRECTION")
                .quantity(dto.getQuantity())
                .reason(dto.getReason() != null ? dto.getReason() : "Manual adjustment")
                .build();
        transactionRepository.save(txn);

        return saved;
    }

    public List<InventoryTransaction> getTransactions() {
        return transactionRepository.findTop50ByOrderByCreatedAtDesc();
    }
}
