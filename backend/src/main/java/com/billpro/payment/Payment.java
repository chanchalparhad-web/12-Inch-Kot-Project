package com.billpro.payment;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sale_id", nullable = false)
    private Long saleId;

    @Column(nullable = false, length = 50)
    private String method;

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(length = 50)
    private String status = "COMPLETED";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Payment() {}

    public Payment(Long id, Long saleId, String method, BigDecimal amount, String status) {
        this.id = id;
        this.saleId = saleId;
        this.method = method;
        this.amount = amount;
        this.status = status != null ? status : "COMPLETED";
    }

    public static PaymentBuilder builder() {
        return new PaymentBuilder();
    }

    public static class PaymentBuilder {
        private Long id;
        private Long saleId;
        private String method;
        private BigDecimal amount;
        private String status = "COMPLETED";

        public PaymentBuilder id(Long id) { this.id = id; return this; }
        public PaymentBuilder saleId(Long saleId) { this.saleId = saleId; return this; }
        public PaymentBuilder method(String method) { this.method = method; return this; }
        public PaymentBuilder amount(BigDecimal amount) { this.amount = amount; return this; }
        public PaymentBuilder status(String status) { this.status = status; return this; }

        public Payment build() {
            return new Payment(id, saleId, method, amount, status);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getSaleId() { return saleId; }
    public void setSaleId(Long saleId) { this.saleId = saleId; }
    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
