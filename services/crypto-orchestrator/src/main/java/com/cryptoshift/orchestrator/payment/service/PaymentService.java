package com.cryptoshift.orchestrator.payment.service;

import com.cryptoshift.orchestrator.payment.model.PaymentEvent;
import com.cryptoshift.orchestrator.payment.model.PaymentInvoice;
import com.cryptoshift.orchestrator.payment.model.PaymentState;
import com.cryptoshift.orchestrator.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.statemachine.config.StateMachineFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository repository;
    private final RateProvider rateProvider;
    private final StateMachineFactory<PaymentState, PaymentEvent> stateMachineFactory;

    @Transactional
    public PaymentInvoice createInvoice(Long orderId, BigDecimal amountUsd){
        log.info("Creating invoice for order: {}", orderId);

        BigDecimal rate = rateProvider.getBitcoinRate();

        BigDecimal amountCrypto = amountUsd.divide(rate, 8, RoundingMode.HALF_UP);

        PaymentInvoice invoice = PaymentInvoice.builder()
                .orderId(orderId)
                .amountUsd(amountUsd)
                .amountCrypto(amountCrypto)
                .cryptoCurrency("BTC")
                .cryptoAddress("MOCK_ADDR_" + UUID.randomUUID().toString().substring(0, 8))
                .state(PaymentState.NEW)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .build();

        PaymentInvoice savedInvoice = repository.save(invoice);
        log.info("Invoice saved with ID: {} and Amount: {} BTC", savedInvoice.getId(), amountCrypto);
        sendEvent(savedInvoice.getId(), PaymentEvent.LOCK_RATE);

        return savedInvoice;
    }

    private void sendEvent(UUID invoiceId, PaymentEvent event) {
        var sm = stateMachineFactory.getStateMachine(invoiceId);
        sm.start();
        sm.sendEvent(event);
    }
}
