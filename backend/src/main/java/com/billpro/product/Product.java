package com.billpro.product;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "business_id", nullable = false)
    private Long businessId;

    @Column(name = "category_id")
    private Long categoryId;

    @Column(nullable = false)
    private String name;

    private String sku;
    private String barcode;

    @Column(name = "purchase_price", precision = 12, scale = 2)
    private BigDecimal purchasePrice = BigDecimal.ZERO;

    @Column(name = "selling_price", precision = 12, scale = 2, nullable = false)
    private BigDecimal sellingPrice = BigDecimal.ZERO;

    @Column(length = 50)
    private String unit = "pcs";

    @Column(name = "low_stock_threshold")
    private Integer lowStockThreshold = 5;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Product() {}

    public Product(Long id, Long businessId, Long categoryId, String name, String sku, String barcode, BigDecimal purchasePrice, BigDecimal sellingPrice, String unit, Integer lowStockThreshold, Boolean active) {
        this.id = id;
        this.businessId = businessId;
        this.categoryId = categoryId;
        this.name = name;
        this.sku = sku;
        this.barcode = barcode;
        this.purchasePrice = purchasePrice != null ? purchasePrice : BigDecimal.ZERO;
        this.sellingPrice = sellingPrice != null ? sellingPrice : BigDecimal.ZERO;
        this.unit = unit != null ? unit : "pcs";
        this.lowStockThreshold = lowStockThreshold != null ? lowStockThreshold : 5;
        this.active = active != null ? active : true;
    }

    public static ProductBuilder builder() {
        return new ProductBuilder();
    }

    public static class ProductBuilder {
        private Long id;
        private Long businessId;
        private Long categoryId;
        private String name;
        private String sku;
        private String barcode;
        private BigDecimal purchasePrice = BigDecimal.ZERO;
        private BigDecimal sellingPrice = BigDecimal.ZERO;
        private String unit = "pcs";
        private Integer lowStockThreshold = 5;
        private Boolean active = true;

        public ProductBuilder id(Long id) { this.id = id; return this; }
        public ProductBuilder businessId(Long businessId) { this.businessId = businessId; return this; }
        public ProductBuilder categoryId(Long categoryId) { this.categoryId = categoryId; return this; }
        public ProductBuilder name(String name) { this.name = name; return this; }
        public ProductBuilder sku(String sku) { this.sku = sku; return this; }
        public ProductBuilder barcode(String barcode) { this.barcode = barcode; return this; }
        public ProductBuilder purchasePrice(BigDecimal purchasePrice) { this.purchasePrice = purchasePrice; return this; }
        public ProductBuilder sellingPrice(BigDecimal sellingPrice) { this.sellingPrice = sellingPrice; return this; }
        public ProductBuilder unit(String unit) { this.unit = unit; return this; }
        public ProductBuilder lowStockThreshold(Integer lowStockThreshold) { this.lowStockThreshold = lowStockThreshold; return this; }
        public ProductBuilder active(Boolean active) { this.active = active; return this; }

        public Product build() {
            return new Product(id, businessId, categoryId, name, sku, barcode, purchasePrice, sellingPrice, unit, lowStockThreshold, active);
        }
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getBusinessId() { return businessId; }
    public void setBusinessId(Long businessId) { this.businessId = businessId; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }
    public BigDecimal getPurchasePrice() { return purchasePrice; }
    public void setPurchasePrice(BigDecimal purchasePrice) { this.purchasePrice = purchasePrice; }
    public BigDecimal getSellingPrice() { return sellingPrice; }
    public void setSellingPrice(BigDecimal sellingPrice) { this.sellingPrice = sellingPrice; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public Integer getLowStockThreshold() { return lowStockThreshold; }
    public void setLowStockThreshold(Integer lowStockThreshold) { this.lowStockThreshold = lowStockThreshold; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
