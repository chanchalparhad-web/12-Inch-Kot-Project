package com.billpro.expense;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "expenses")
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "business_id", nullable = false)
    private Long businessId;

    @Column(nullable = false, length = 100)
    private String category;

    private String description;

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod = "CASH";

    @Column(name = "expense_date")
    private LocalDate expenseDate = LocalDate.now();

    private String notes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Expense() {}

    public Expense(Long id, Long businessId, String category, String description, BigDecimal amount, String paymentMethod, LocalDate expenseDate, String notes) {
        this.id = id;
        this.businessId = businessId;
        this.category = category;
        this.description = description;
        this.amount = amount;
        this.paymentMethod = paymentMethod != null ? paymentMethod : "CASH";
        this.expenseDate = expenseDate != null ? expenseDate : LocalDate.now();
        this.notes = notes;
    }

    public static ExpenseBuilder builder() {
        return new ExpenseBuilder();
    }

    public static class ExpenseBuilder {
        private Long id;
        private Long businessId;
        private String category;
        private String description;
        private BigDecimal amount;
        private String paymentMethod = "CASH";
        private LocalDate expenseDate = LocalDate.now();
        private String notes;

        public ExpenseBuilder id(Long id) { this.id = id; return this; }
        public ExpenseBuilder businessId(Long businessId) { this.businessId = businessId; return this; }
        public ExpenseBuilder category(String category) { this.category = category; return this; }
        public ExpenseBuilder description(String description) { this.description = description; return this; }
        public ExpenseBuilder amount(BigDecimal amount) { this.amount = amount; return this; }
        public ExpenseBuilder paymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; return this; }
        public ExpenseBuilder expenseDate(LocalDate expenseDate) { this.expenseDate = expenseDate; return this; }
        public ExpenseBuilder notes(String notes) { this.notes = notes; return this; }

        public Expense build() {
            return new Expense(id, businessId, category, description, amount, paymentMethod, expenseDate, notes);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getBusinessId() { return businessId; }
    public void setBusinessId(Long businessId) { this.businessId = businessId; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public LocalDate getExpenseDate() { return expenseDate; }
    public void setExpenseDate(LocalDate expenseDate) { this.expenseDate = expenseDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
