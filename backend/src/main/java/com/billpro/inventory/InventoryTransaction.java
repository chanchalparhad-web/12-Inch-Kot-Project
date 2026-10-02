package com.billpro.inventory;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_transactions")
public class InventoryTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "reference_id")
    private String referenceId;

    private String reason;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public InventoryTransaction() {}

    public InventoryTransaction(Long id, Long productId, String type, Integer quantity, String referenceId, String reason) {
        this.id = id;
        this.productId = productId;
        this.type = type;
        this.quantity = quantity;
        this.referenceId = referenceId;
        this.reason = reason;
    }

    public static InventoryTransactionBuilder builder() {
        return new InventoryTransactionBuilder();
    }

    public static class InventoryTransactionBuilder {
        private Long id;
        private Long productId;
        private String type;
        private Integer quantity;
        private String referenceId;
        private String reason;

        public InventoryTransactionBuilder id(Long id) { this.id = id; return this; }
        public InventoryTransactionBuilder productId(Long productId) { this.productId = productId; return this; }
        public InventoryTransactionBuilder type(String type) { this.type = type; return this; }
        public InventoryTransactionBuilder quantity(Integer quantity) { this.quantity = quantity; return this; }
        public InventoryTransactionBuilder referenceId(String referenceId) { this.referenceId = referenceId; return this; }
        public InventoryTransactionBuilder reason(String reason) { this.reason = reason; return this; }

        public InventoryTransaction build() {
            return new InventoryTransaction(id, productId, type, quantity, referenceId, reason);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public String getReferenceId() { return referenceId; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
