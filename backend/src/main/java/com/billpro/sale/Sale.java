package com.billpro.sale;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sales")
public class Sale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "business_id", nullable = false)
    private Long businessId;

    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "invoice_number", nullable = false, length = 100)
    private String invoiceNumber;

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2)
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2)
    private BigDecimal tax = BigDecimal.ZERO;

    @Column(name = "grand_total", precision = 12, scale = 2, nullable = false)
    private BigDecimal grandTotal = BigDecimal.ZERO;

    @Column(name = "payment_status", length = 50)
    private String paymentStatus = "PAID";

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SaleItem> items = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Sale() {}

    public Sale(Long id, Long businessId, Long customerId, String invoiceNumber, BigDecimal subtotal, BigDecimal discount, BigDecimal tax, BigDecimal grandTotal, String paymentStatus, List<SaleItem> items) {
        this.id = id;
        this.businessId = businessId;
        this.customerId = customerId;
        this.invoiceNumber = invoiceNumber;
        this.subtotal = subtotal != null ? subtotal : BigDecimal.ZERO;
        this.discount = discount != null ? discount : BigDecimal.ZERO;
        this.tax = tax != null ? tax : BigDecimal.ZERO;
        this.grandTotal = grandTotal != null ? grandTotal : BigDecimal.ZERO;
        this.paymentStatus = paymentStatus != null ? paymentStatus : "PAID";
        this.items = items != null ? items : new ArrayList<>();
    }

    public static SaleBuilder builder() {
        return new SaleBuilder();
    }

    public static class SaleBuilder {
        private Long id;
        private Long businessId;
        private Long customerId;
        private String invoiceNumber;
        private BigDecimal subtotal = BigDecimal.ZERO;
        private BigDecimal discount = BigDecimal.ZERO;
        private BigDecimal tax = BigDecimal.ZERO;
        private BigDecimal grandTotal = BigDecimal.ZERO;
        private String paymentStatus = "PAID";
        private List<SaleItem> items = new ArrayList<>();

        public SaleBuilder id(Long id) { this.id = id; return this; }
        public SaleBuilder businessId(Long businessId) { this.businessId = businessId; return this; }
        public SaleBuilder customerId(Long customerId) { this.customerId = customerId; return this; }
        public SaleBuilder invoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; return this; }
        public SaleBuilder subtotal(BigDecimal subtotal) { this.subtotal = subtotal; return this; }
        public SaleBuilder discount(BigDecimal discount) { this.discount = discount; return this; }
        public SaleBuilder tax(BigDecimal tax) { this.tax = tax; return this; }
        public SaleBuilder grandTotal(BigDecimal grandTotal) { this.grandTotal = grandTotal; return this; }
        public SaleBuilder paymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; return this; }
        public SaleBuilder items(List<SaleItem> items) { this.items = items; return this; }

        public Sale build() {
            return new Sale(id, businessId, customerId, invoiceNumber, subtotal, discount, tax, grandTotal, paymentStatus, items);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getBusinessId() { return businessId; }
    public void setBusinessId(Long businessId) { this.businessId = businessId; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
    public BigDecimal getDiscount() { return discount; }
    public void setDiscount(BigDecimal discount) { this.discount = discount; }
    public BigDecimal getTax() { return tax; }
    public void setTax(BigDecimal tax) { this.tax = tax; }
    public BigDecimal getGrandTotal() { return grandTotal; }
    public void setGrandTotal(BigDecimal grandTotal) { this.grandTotal = grandTotal; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public List<SaleItem> getItems() { return items; }
    public void setItems(List<SaleItem> items) { this.items = items; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
