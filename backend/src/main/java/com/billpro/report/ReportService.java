package com.billpro.report;

import com.billpro.expense.Expense;
import com.billpro.expense.ExpenseRepository;
import com.billpro.inventory.Inventory;
import com.billpro.inventory.InventoryRepository;
import com.billpro.payment.Payment;
import com.billpro.payment.PaymentRepository;
import com.billpro.product.Product;
import com.billpro.product.ProductRepository;
import com.billpro.sale.Sale;
import com.billpro.sale.SaleItem;
import com.billpro.sale.SaleRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class ReportService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final ExpenseRepository expenseRepository;
    private final PaymentRepository paymentRepository;

    public ReportService(SaleRepository saleRepository,
                         ProductRepository productRepository,
                         InventoryRepository inventoryRepository,
                         ExpenseRepository expenseRepository,
                         PaymentRepository paymentRepository) {
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.expenseRepository = expenseRepository;
        this.paymentRepository = paymentRepository;
    }

    public Map<String, Object> getSalesReport(Long businessId) {
        List<Sale> sales = saleRepository.findByBusinessIdOrderByCreatedAtDesc(businessId);

        BigDecimal totalSales = BigDecimal.ZERO;
        for (Sale s : sales) {
            totalSales = totalSales.add(s.getGrandTotal());
        }

        int totalBills = sales.size();
        BigDecimal avgBillValue = totalBills > 0 
                ? totalSales.divide(BigDecimal.valueOf(totalBills), 2, RoundingMode.HALF_UP) 
                : BigDecimal.ZERO;

        Map<String, Object> report = new HashMap<>();
        report.put("totalSales", totalSales);
        report.put("totalBills", totalBills);
        report.put("avgBillValue", avgBillValue);
        return report;
    }

    public Map<String, Object> getProductReport(Long businessId) {
        List<Sale> sales = saleRepository.findByBusinessIdOrderByCreatedAtDesc(businessId);
        Map<Long, Map<String, Object>> productMap = new HashMap<>();

        for (Sale s : sales) {
            for (SaleItem item : s.getItems()) {
                Long pId = item.getProductId();
                if (pId == null) continue;

                Map<String, Object> pData = productMap.getOrDefault(pId, new HashMap<>());
                pData.put("productId", pId);
                pData.put("productName", item.getProductName());

                int currentQty = (int) pData.getOrDefault("quantitySold", 0);
                pData.put("quantitySold", currentQty + item.getQuantity());

                BigDecimal currentRev = (BigDecimal) pData.getOrDefault("revenue", BigDecimal.ZERO);
                pData.put("revenue", currentRev.add(item.getTotal()));

                productMap.put(pId, pData);
            }
        }

        List<Map<String, Object>> list = new ArrayList<>(productMap.values());
        list.sort((a, b) -> ((BigDecimal) b.get("revenue")).compareTo((BigDecimal) a.get("revenue")));

        Map<String, Object> report = new HashMap<>();
        report.put("topSellingProducts", list);
        return report;
    }

    public Map<String, Object> getInventoryReport(Long businessId) {
        List<Product> products = productRepository.findByBusinessIdAndActiveTrue(businessId);

        int totalProducts = products.size();
        int lowStockCount = 0;
        int outOfStockCount = 0;
        BigDecimal totalStockValuation = BigDecimal.ZERO;

        for (Product p : products) {
            Inventory inv = inventoryRepository.findByProductId(p.getId())
                    .orElse(Inventory.builder().productId(p.getId()).currentStock(0).build());

            int stock = inv.getCurrentStock();
            if (stock == 0) {
                outOfStockCount++;
            } else if (stock <= p.getLowStockThreshold()) {
                lowStockCount++;
            }

            BigDecimal costPrice = p.getPurchasePrice() != null ? p.getPurchasePrice() : BigDecimal.ZERO;
            totalStockValuation = totalStockValuation.add(costPrice.multiply(BigDecimal.valueOf(stock)));
        }

        Map<String, Object> report = new HashMap<>();
        report.put("totalProducts", totalProducts);
        report.put("lowStockCount", lowStockCount);
        report.put("outOfStockCount", outOfStockCount);
        report.put("totalStockValuation", totalStockValuation);
        return report;
    }

    public Map<String, Object> getExpenseReport(Long businessId) {
        List<Expense> expenses = expenseRepository.findByBusinessIdOrderByExpenseDateDesc(businessId);

        BigDecimal totalExpenses = BigDecimal.ZERO;
        Map<String, BigDecimal> categoryTotals = new HashMap<>();

        for (Expense e : expenses) {
            totalExpenses = totalExpenses.add(e.getAmount());
            String cat = e.getCategory() != null ? e.getCategory() : "Other";
            categoryTotals.put(cat, categoryTotals.getOrDefault(cat, BigDecimal.ZERO).add(e.getAmount()));
        }

        Map<String, Object> report = new HashMap<>();
        report.put("totalExpenses", totalExpenses);
        report.put("expenseByCategory", categoryTotals);
        return report;
    }

    /**
     * Estimated Profit Calculation:
     * Sales Revenue - Product Cost - Expenses = Estimated Profit (SRS 7.16)
     */
    public Map<String, Object> getProfitSummary(Long businessId) {
        List<Sale> sales = saleRepository.findByBusinessIdOrderByCreatedAtDesc(businessId);
        List<Expense> expenses = expenseRepository.findByBusinessIdOrderByExpenseDateDesc(businessId);

        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalProductCost = BigDecimal.ZERO;

        for (Sale s : sales) {
            totalRevenue = totalRevenue.add(s.getGrandTotal());
            for (SaleItem item : s.getItems()) {
                Product p = item.getProductId() != null ? productRepository.findById(item.getProductId()).orElse(null) : null;
                BigDecimal cost = p != null && p.getPurchasePrice() != null 
                        ? p.getPurchasePrice() 
                        : item.getUnitPrice().multiply(BigDecimal.valueOf(0.6));
                totalProductCost = totalProductCost.add(cost.multiply(BigDecimal.valueOf(item.getQuantity())));
            }
        }

        BigDecimal totalExpenses = BigDecimal.ZERO;
        for (Expense e : expenses) {
            totalExpenses = totalExpenses.add(e.getAmount());
        }

        BigDecimal estimatedProfit = totalRevenue.subtract(totalProductCost).subtract(totalExpenses);

        Map<String, Object> summary = new HashMap<>();
        summary.put("salesRevenue", totalRevenue);
        summary.put("productCost", totalProductCost);
        summary.put("totalExpenses", totalExpenses);
        summary.put("estimatedProfit", estimatedProfit);
        summary.put("disclaimer", "Estimated/business-management calculation rather than formal accounting statement.");
        return summary;
    }
}
