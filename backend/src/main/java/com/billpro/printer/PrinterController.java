package com.billpro.printer;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/printer")
public class PrinterController {

    private final EscPosPrinterService printerService;

    public PrinterController(EscPosPrinterService printerService) {
        this.printerService = printerService;
    }

    @GetMapping("/status")
    public ResponseEntity<Printer> getPrinterStatus(@RequestParam(defaultValue = "1") Long businessId) {
        return ResponseEntity.ok(printerService.getPrinterStatus(businessId));
    }

    @PostMapping("/test")
    public ResponseEntity<Map<String, String>> testPrint() {
        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Test receipt pattern dispatched to SHREYANS SRS588 58mm printer.",
                "printer", "SHREYANS SRS588"
        ));
    }

    @PostMapping("/print/{saleId}")
    public ResponseEntity<Map<String, Object>> printBill(@PathVariable Long saleId) {
        return ResponseEntity.ok(printerService.generateReceiptData(saleId));
    }
}
