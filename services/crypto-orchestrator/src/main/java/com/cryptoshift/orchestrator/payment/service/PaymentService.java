package com.cryptoshift.orchestrator.payment.service;

import com.cryptoshift.orchestrator.payment.model.PaymentInvoice;
import com.cryptoshift.orchestrator.payment.model.PaymentState;
import com.cryptoshift.orchestrator.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository repository;

    @Transactional
    public PaymentInvoice createInvoice(Long orderId, BigDecimal amount){
        log.info("Creating invoice for order: {}", orderId);

        PaymentInvoice invoice = PaymentInvoice.builder()
                .orderId(orderId)
                .amountUsd(amount)
                .state(PaymentState.NEW)
                .build();
        return repository.save(invoice);
    }


}
