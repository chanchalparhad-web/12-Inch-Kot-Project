package com.billpro.sale;

import com.billpro.business.Business;
import com.billpro.business.BusinessRepository;
import com.billpro.exception.InsufficientStockException;
import com.billpro.exception.ResourceNotFoundException;
import com.billpro.inventory.Inventory;
import com.billpro.inventory.InventoryRepository;
import com.billpro.inventory.InventoryTransaction;
import com.billpro.inventory.InventoryTransactionRepository;
import com.billpro.payment.Payment;
import com.billpro.payment.PaymentRepository;
import com.billpro.product.Product;
import com.billpro.product.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final BusinessRepository businessRepository;
    private final PaymentRepository paymentRepository;

    public SaleService(SaleRepository saleRepository,
                       ProductRepository productRepository,
                       InventoryRepository inventoryRepository,
                       InventoryTransactionRepository transactionRepository,
                       BusinessRepository businessRepository,
                       PaymentRepository paymentRepository) {
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.transactionRepository = transactionRepository;
        this.businessRepository = businessRepository;
        this.paymentRepository = paymentRepository;
    }

    public List<Sale> getSales(Long businessId) {
        return saleRepository.findByBusinessIdOrderByCreatedAtDesc(businessId);
    }

    public Sale getSaleById(Long id) {
        return saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice Sale not found with id: " + id));
    }

    /**
     * Complete Sale Execution:
     * Complying with:
     * Rule 1 - Unique Invoice Number
     * Rule 2 - Reduce inventory only after sale is successfully completed
     * Rule 3 - If sale fails, inventory is NOT reduced (Transactional rollback)
     * Rule 4 - Save snapshot of product name/price/tax so historical invoice doesn't change
     * Rule 5 - Prevent negative stock
     * Rule 7 - Link payment record
     */
    @Transactional
    public Sale createSale(SaleRequestDto request) {
        Long businessId = request.getBusinessId() != null ? request.getBusinessId() : 1L;
        Business business = businessRepository.findById(businessId)
                .orElseGet(() -> Business.builder().id(1L).invoicePrefix("INV").gstEnabled(true).build());

        // Generate unique invoice number (Rule 1)
        long nextNum = saleRepository.countByBusinessId(businessId) + 10043;
        String invoiceNumber = String.format("%s-%05d",
                business.getInvoicePrefix() != null ? business.getInvoicePrefix() : "INV", nextNum);

        Sale sale = Sale.builder()
                .businessId(businessId)
                .customerId(request.getCustomerId())
                .invoiceNumber(invoiceNumber)
                .discount(request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO)
                .paymentStatus("PAID")
                .items(new ArrayList<>())
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;

        for (SaleItemRequestDto itemDto : request.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemDto.getProductId()));

            // Stock Check (Rule 5)
            Inventory inventory = inventoryRepository.findByProductId(product.getId())
                    .orElse(Inventory.builder().productId(product.getId()).currentStock(0).build());

            if (inventory.getCurrentStock() < itemDto.getQuantity()) {
                throw new InsufficientStockException("Insufficient stock for product: " + product.getName() + 
                        ". Available: " + inventory.getCurrentStock() + ", Requested: " + itemDto.getQuantity());
            }

            // Calculations with precise decimal arithmetic (SRS Section 7.7)
            BigDecimal unitPrice = product.getSellingPrice();
            BigDecimal qty = BigDecimal.valueOf(itemDto.getQuantity());
            BigDecimal itemDisc = itemDto.getItemDiscount() != null ? itemDto.getItemDiscount() : BigDecimal.ZERO;
            BigDecimal lineSubtotal = unitPrice.subtract(itemDisc).multiply(qty);

            BigDecimal lineTax = BigDecimal.ZERO;
            if (Boolean.TRUE.equals(business.getGstEnabled()) && product.getGstPercentage() != null && product.getGstPercentage().compareTo(BigDecimal.ZERO) > 0) {
                lineTax = lineSubtotal.multiply(product.getGstPercentage()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            }

            BigDecimal lineTotal = lineSubtotal.add(lineTax);

            subtotal = subtotal.add(unitPrice.multiply(qty));
            totalTax = totalTax.add(lineTax);

            // Snapshot item (Rule 4)
            SaleItem saleItem = SaleItem.builder()
                    .sale(sale)
                    .productId(product.getId())
                    .productName(product.getName())
                    .quantity(itemDto.getQuantity())
                    .unitPrice(unitPrice)
                    .discount(itemDisc)
                    .tax(lineTax)
                    .total(lineTotal)
                    .build();

            sale.getItems().add(saleItem);

            // Reduce inventory stock (Rule 2)
            inventory.setCurrentStock(inventory.getCurrentStock() - itemDto.getQuantity());
            inventoryRepository.save(inventory);

            // Log inventory transaction
            InventoryTransaction txn = InventoryTransaction.builder()
                    .productId(product.getId())
                    .type("SALE_DEDUCTION")
                    .quantity(-itemDto.getQuantity())
                    .referenceId(invoiceNumber)
                    .reason("POS Sale Invoice")
                    .build();
            transactionRepository.save(txn);
        }

        BigDecimal discount = request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO;
        BigDecimal grandTotal = subtotal.subtract(discount).add(totalTax);

        sale.setSubtotal(subtotal);
        sale.setTax(totalTax);
        sale.setGrandTotal(grandTotal.max(BigDecimal.ZERO));

        Sale savedSale = saleRepository.save(sale);

        // Record Payment (Rule 7)
        Payment payment = Payment.builder()
                .saleId(savedSale.getId())
                .method(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH")
                .amount(savedSale.getGrandTotal())
                .status("COMPLETED")
                .build();
        paymentRepository.save(payment);

        return savedSale;
    }
}
