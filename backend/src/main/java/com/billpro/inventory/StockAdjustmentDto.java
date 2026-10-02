package com.billpro.inventory;

import jakarta.validation.constraints.NotNull;

public class StockAdjustmentDto {

    @NotNull
    private Long productId;

    @NotNull
    private Integer quantity;

    private String type;
    private String reason;

    public StockAdjustmentDto() {}

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
