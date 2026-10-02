package com.billpro.customer;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "business_id", nullable = false)
    private Long businessId;

    @Column(nullable = false)
    private String name;

    private String mobile;
    private String email;
    private String address;
    private String gstin;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Customer() {}

    public Customer(Long id, Long businessId, String name, String mobile, String email, String address, String gstin) {
        this.id = id;
        this.businessId = businessId;
        this.name = name;
        this.mobile = mobile;
        this.email = email;
        this.address = address;
        this.gstin = gstin;
    }

    public static CustomerBuilder builder() {
        return new CustomerBuilder();
    }

    public static class CustomerBuilder {
        private Long id;
        private Long businessId;
        private String name;
        private String mobile;
        private String email;
        private String address;
        private String gstin;

        public CustomerBuilder id(Long id) { this.id = id; return this; }
        public CustomerBuilder businessId(Long businessId) { this.businessId = businessId; return this; }
        public CustomerBuilder name(String name) { this.name = name; return this; }
        public CustomerBuilder mobile(String mobile) { this.mobile = mobile; return this; }
        public CustomerBuilder email(String email) { this.email = email; return this; }
        public CustomerBuilder address(String address) { this.address = address; return this; }
        public CustomerBuilder gstin(String gstin) { this.gstin = gstin; return this; }

        public Customer build() {
            return new Customer(id, businessId, name, mobile, email, address, gstin);
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
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getGstin() { return gstin; }
    public void setGstin(String gstin) { this.gstin = gstin; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
