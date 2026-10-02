package com.billpro.sale;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public class SaleRequestDto {
    private Long businessId = 1L;
    private Long customerId;

    @NotEmpty
    private List<SaleItemRequestDto> items;

    private BigDecimal discount = BigDecimal.ZERO;

    @NotNull
    private String paymentMethod;

    private BigDecimal cashReceived;

    public SaleRequestDto() {}

    public Long getBusinessId() { return businessId; }
    public void setBusinessId(Long businessId) { this.businessId = businessId; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public List<SaleItemRequestDto> getItems() { return items; }
    public void setItems(List<SaleItemRequestDto> items) { this.items = items; }
    public BigDecimal getDiscount() { return discount; }
    public void setDiscount(BigDecimal discount) { this.discount = discount; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public BigDecimal getCashReceived() { return cashReceived; }
    public void setCashReceived(BigDecimal cashReceived) { this.cashReceived = cashReceived; }
}
