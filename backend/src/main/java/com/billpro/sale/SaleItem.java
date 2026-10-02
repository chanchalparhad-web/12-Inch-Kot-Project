package com.billpro.sale;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "sale_items")
public class SaleItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sale_id", nullable = false)
    @JsonIgnore
    private Sale sale;

    @Column(name = "product_id")
    private Long productId;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", precision = 12, scale = 2, nullable = false)
    private BigDecimal unitPrice;

    @Column(precision = 12, scale = 2)
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2)
    private BigDecimal tax = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal total;

    public SaleItem() {}

    public SaleItem(Long id, Sale sale, Long productId, String productName, Integer quantity, BigDecimal unitPrice, BigDecimal discount, BigDecimal tax, BigDecimal total) {
        this.id = id;
        this.sale = sale;
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.discount = discount != null ? discount : BigDecimal.ZERO;
        this.tax = tax != null ? tax : BigDecimal.ZERO;
        this.total = total;
    }

    public static SaleItemBuilder builder() {
        return new SaleItemBuilder();
    }

    public static class SaleItemBuilder {
        private Long id;
        private Sale sale;
        private Long productId;
        private String productName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal discount = BigDecimal.ZERO;
        private BigDecimal tax = BigDecimal.ZERO;
        private BigDecimal total;

        public SaleItemBuilder id(Long id) { this.id = id; return this; }
        public SaleItemBuilder sale(Sale sale) { this.sale = sale; return this; }
        public SaleItemBuilder productId(Long productId) { this.productId = productId; return this; }
        public SaleItemBuilder productName(String productName) { this.productName = productName; return this; }
        public SaleItemBuilder quantity(Integer quantity) { this.quantity = quantity; return this; }
        public SaleItemBuilder unitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; return this; }
        public SaleItemBuilder discount(BigDecimal discount) { this.discount = discount; return this; }
        public SaleItemBuilder tax(BigDecimal tax) { this.tax = tax; return this; }
        public SaleItemBuilder total(BigDecimal total) { this.total = total; return this; }

        public SaleItem build() {
            return new SaleItem(id, sale, productId, productName, quantity, unitPrice, discount, tax, total);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Sale getSale() { return sale; }
    public void setSale(Sale sale) { this.sale = sale; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public BigDecimal getDiscount() { return discount; }
    public void setDiscount(BigDecimal discount) { this.discount = discount; }
    public BigDecimal getTax() { return tax; }
    public void setTax(BigDecimal tax) { this.tax = tax; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
}
