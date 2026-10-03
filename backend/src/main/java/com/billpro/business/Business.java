package com.billpro.business;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "businesses")
public class Business {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "owner_name", nullable = false)
    private String ownerName;

    @Column(nullable = false)
    private String mobile;

    private String email;
    private String address;
    private String city;
    private String state;
    private String pincode;

    @Column(name = "invoice_prefix")
    private String invoicePrefix = "INV";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Business() {}

    public Business(Long id, String name, String ownerName, String mobile, String email, String address, String city, String state, String pincode, String invoicePrefix) {
        this.id = id;
        this.name = name;
        this.ownerName = ownerName;
        this.mobile = mobile;
        this.email = email;
        this.address = address;
        this.city = city;
        this.state = state;
        this.pincode = pincode;
        this.invoicePrefix = invoicePrefix != null ? invoicePrefix : "INV";
    }

    public static BusinessBuilder builder() {
        return new BusinessBuilder();
    }

    public static class BusinessBuilder {
        private Long id;
        private String name;
        private String ownerName;
        private String mobile;
        private String email;
        private String address;
        private String city;
        private String state;
        private String pincode;
        private String invoicePrefix = "INV";

        public BusinessBuilder id(Long id) { this.id = id; return this; }
        public BusinessBuilder name(String name) { this.name = name; return this; }
        public BusinessBuilder ownerName(String ownerName) { this.ownerName = ownerName; return this; }
        public BusinessBuilder mobile(String mobile) { this.mobile = mobile; return this; }
        public BusinessBuilder email(String email) { this.email = email; return this; }
        public BusinessBuilder address(String address) { this.address = address; return this; }
        public BusinessBuilder city(String city) { this.city = city; return this; }
        public BusinessBuilder state(String state) { this.state = state; return this; }
        public BusinessBuilder pincode(String pincode) { this.pincode = pincode; return this; }
        public BusinessBuilder invoicePrefix(String invoicePrefix) { this.invoicePrefix = invoicePrefix; return this; }

        public Business build() {
            return new Business(id, name, ownerName, mobile, email, address, city, state, pincode, invoicePrefix);
        }
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }
    public String getInvoicePrefix() { return invoicePrefix; }
    public void setInvoicePrefix(String invoicePrefix) { this.invoicePrefix = invoicePrefix; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
