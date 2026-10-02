package com.billpro.payment;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @Transactional
    public Payment recordPayment(Payment payment) {
        if (payment.getStatus() == null) {
            payment.setStatus("COMPLETED");
        }
        return paymentRepository.save(payment);
    }
}
