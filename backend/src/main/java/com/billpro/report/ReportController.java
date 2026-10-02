package com.billpro.report;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/sales")
    public ResponseEntity<Map<String, Object>> getSalesReport(@RequestParam(defaultValue = "1") Long businessId) {
        return ResponseEntity.ok(reportService.getSalesReport(businessId));
    }

    @GetMapping("/products")
    public ResponseEntity<Map<String, Object>> getProductReport(@RequestParam(defaultValue = "1") Long businessId) {
        return ResponseEntity.ok(reportService.getProductReport(businessId));
    }

    @GetMapping("/inventory")
    public ResponseEntity<Map<String, Object>> getInventoryReport(@RequestParam(defaultValue = "1") Long businessId) {
        return ResponseEntity.ok(reportService.getInventoryReport(businessId));
    }

    @GetMapping("/expenses")
    public ResponseEntity<Map<String, Object>> getExpenseReport(@RequestParam(defaultValue = "1") Long businessId) {
        return ResponseEntity.ok(reportService.getExpenseReport(businessId));
    }

    @GetMapping("/profit")
    public ResponseEntity<Map<String, Object>> getProfitSummary(@RequestParam(defaultValue = "1") Long businessId) {
        return ResponseEntity.ok(reportService.getProfitSummary(businessId));
    }
}
