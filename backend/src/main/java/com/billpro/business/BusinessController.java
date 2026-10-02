package com.billpro.business;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/business")
public class BusinessController {

    private final BusinessService businessService;

    public BusinessController(BusinessService businessService) {
        this.businessService = businessService;
    }

    @GetMapping
    public ResponseEntity<Business> getBusiness(@RequestParam(defaultValue = "1") Long id) {
        return ResponseEntity.ok(businessService.getBusiness(id));
    }

    @PutMapping
    public ResponseEntity<Business> updateBusiness(@RequestParam(defaultValue = "1") Long id,
                                                   @RequestBody Business business) {
        return ResponseEntity.ok(businessService.updateBusiness(id, business));
    }
}
