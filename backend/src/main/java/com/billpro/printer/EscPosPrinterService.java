package com.billpro.printer;

import com.billpro.business.Business;
import com.billpro.business.BusinessRepository;
import com.billpro.exception.ResourceNotFoundException;
import com.billpro.payment.Payment;
import com.billpro.payment.PaymentRepository;
import com.billpro.sale.Sale;
import com.billpro.sale.SaleItem;
import com.billpro.sale.SaleRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
public class EscPosPrinterService {

    private final PrinterRepository printerRepository;
    private final SaleRepository saleRepository;
    private final BusinessRepository businessRepository;
    private final PaymentRepository paymentRepository;

    private static final int LINE_WIDTH = 32; // 58mm Thermal Receipt standard

    public EscPosPrinterService(PrinterRepository printerRepository,
                               SaleRepository saleRepository,
                               BusinessRepository businessRepository,
                               PaymentRepository paymentRepository) {
        this.printerRepository = printerRepository;
        this.saleRepository = saleRepository;
        this.businessRepository = businessRepository;
        this.paymentRepository = paymentRepository;
    }

    public Printer getPrinterStatus(Long businessId) {
        return printerRepository.findByBusinessId(businessId)
                .orElseGet(() -> printerRepository.save(Printer.builder()
                        .businessId(businessId)
                        .name("SHREYANS SRS588")
                        .connectionType("BLUETOOTH")
                        .paperWidth(58)
                        .status("CONNECTED")
                        .build()));
    }

    public Map<String, Object> generateReceiptData(Long saleId) {
        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new ResourceNotFoundException("Sale invoice not found with id: " + saleId));

        Business business = businessRepository.findById(sale.getBusinessId())
                .orElseGet(() -> Business.builder().name("Rahul Traders").city("Pune").state("Maharashtra").build());

        Payment payment = paymentRepository.findBySaleId(saleId).orElse(null);

        StringBuilder textBuilder = new StringBuilder();

        textBuilder.append("================================\n");
        textBuilder.append(centerText(business.getName().toUpperCase())).append("\n");
        if (business.getAddress() != null) textBuilder.append(centerText(business.getAddress())).append("\n");
        if (business.getCity() != null || business.getState() != null) {
            textBuilder.append(centerText((business.getCity() != null ? business.getCity() : "") + ", " + 
                    (business.getState() != null ? business.getState() : ""))).append("\n");
        }
        if (Boolean.TRUE.equals(business.getGstEnabled()) && business.getGstin() != null) {
            textBuilder.append(centerText("GSTIN: " + business.getGstin())).append("\n");
        }
        textBuilder.append("================================\n");

        textBuilder.append("Invoice: ").append(sale.getInvoiceNumber()).append("\n");
        if (sale.getCreatedAt() != null) {
            textBuilder.append("Date: ").append(sale.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))).append("\n");
        }
        textBuilder.append("--------------------------------\n");
        textBuilder.append("Item           Qty   Rate  Amount\n");
        textBuilder.append("--------------------------------\n");

        for (SaleItem item : sale.getItems()) {
            String nameTrunc = item.getProductName().length() > 14 
                    ? item.getProductName().substring(0, 14) 
                    : item.getProductName();
            nameTrunc = String.format("%-14s", nameTrunc);
            String qtyStr = String.format("%3d", item.getQuantity());
            String rateStr = String.format("%6s", item.getUnitPrice().setScale(0, BigDecimal.ROUND_HALF_UP).toString());
            String amountStr = String.format("%7s", item.getTotal().setScale(2, BigDecimal.ROUND_HALF_UP).toString());

            textBuilder.append(nameTrunc).append(" ").append(qtyStr).append(" ").append(rateStr).append(" ").append(amountStr).append("\n");
        }

        textBuilder.append("--------------------------------\n");
        textBuilder.append(formatRow("Subtotal", "₹" + sale.getSubtotal().setScale(2, BigDecimal.ROUND_HALF_UP))).append("\n");

        if (sale.getDiscount() != null && sale.getDiscount().compareTo(BigDecimal.ZERO) > 0) {
            textBuilder.append(formatRow("Discount", "-₹" + sale.getDiscount().setScale(2, BigDecimal.ROUND_HALF_UP))).append("\n");
        }

        if (Boolean.TRUE.equals(business.getGstEnabled()) && sale.getTax() != null && sale.getTax().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal halfTax = sale.getTax().divide(BigDecimal.valueOf(2), 2, BigDecimal.ROUND_HALF_UP);
            textBuilder.append(formatRow("CGST", "₹" + halfTax)).append("\n");
            textBuilder.append(formatRow("SGST", "₹" + halfTax)).append("\n");
        }

        textBuilder.append("--------------------------------\n");
        textBuilder.append(formatRow("TOTAL", "₹" + sale.getGrandTotal().setScale(2, BigDecimal.ROUND_HALF_UP))).append("\n");
        textBuilder.append("--------------------------------\n");

        textBuilder.append("Payment Mode: ").append(payment != null ? payment.getMethod() : "CASH").append("\n\n");
        textBuilder.append(centerText("THANK YOU! VISIT AGAIN")).append("\n");
        textBuilder.append("================================\n");

        Map<String, Object> result = new HashMap<>();
        result.put("printerName", "SHREYANS SRS588");
        result.put("paperWidth", 58);
        result.put("invoiceNumber", sale.getInvoiceNumber());
        result.put("receiptText", textBuilder.toString());
        result.put("status", "SUCCESS");
        return result;
    }

    private String centerText(String text) {
        if (text.length() >= LINE_WIDTH) return text.substring(0, LINE_WIDTH);
        int padding = (LINE_WIDTH - text.length()) / 2;
        return " ".repeat(padding) + text;
    }

    private String formatRow(String left, String right) {
        int space = LINE_WIDTH - left.length() - right.length();
        if (space < 1) space = 1;
        return left + " ".repeat(space) + right;
    }
}
