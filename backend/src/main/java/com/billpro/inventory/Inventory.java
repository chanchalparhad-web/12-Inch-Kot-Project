package com.billpro.inventory;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory")
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false, unique = true)
    private Long productId;

    @Column(name = "current_stock", nullable = false)
    private Integer currentStock = 0;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Inventory() {}

    public Inventory(Long id, Long productId, Integer currentStock) {
        this.id = id;
        this.productId = productId;
        this.currentStock = currentStock != null ? currentStock : 0;
    }

    public static InventoryBuilder builder() {
        return new InventoryBuilder();
    }

    public static class InventoryBuilder {
        private Long id;
        private Long productId;
        private Integer currentStock = 0;

        public InventoryBuilder id(Long id) { this.id = id; return this; }
        public InventoryBuilder productId(Long productId) { this.productId = productId; return this; }
        public InventoryBuilder currentStock(Integer currentStock) { this.currentStock = currentStock; return this; }

        public Inventory build() {
            return new Inventory(id, productId, currentStock);
        }
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Integer getCurrentStock() { return currentStock; }
    public void setCurrentStock(Integer currentStock) { this.currentStock = currentStock; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
