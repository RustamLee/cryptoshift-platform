package com.cryptoshift.orchestrator.payment.service;

import com.cryptoshift.orchestrator.payment.dto.PaymentStatusEvent;
import com.cryptoshift.orchestrator.payment.event.InvoiceCreatedEvent;
import com.cryptoshift.orchestrator.payment.model.PaymentEvent;
import com.cryptoshift.orchestrator.payment.model.PaymentInvoice;
import com.cryptoshift.orchestrator.payment.model.PaymentState;
import com.cryptoshift.orchestrator.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.statemachine.config.StateMachineFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository repository;
    private final RateProvider rateProvider;
    private final StateMachineFactory<PaymentState, PaymentEvent> stateMachineFactory;
    private final StringRedisTemplate redisTemplate;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final PaymentStatusProducer paymentStatusProducer;

    @Transactional
    public PaymentInvoice createInvoice(Long orderId, BigDecimal amountUsd){
        log.info("Creating invoice for order: {}", orderId);

        BigDecimal rate = rateProvider.getBitcoinRate();
        BigDecimal amountCrypto = amountUsd.divide(rate, 8, RoundingMode.HALF_UP);

        PaymentInvoice invoice = PaymentInvoice.builder()
                .orderId(orderId)
                .amountUsd(amountUsd)
                .amountCrypto(amountCrypto)
                .lockedRate(rate)
                .cryptoCurrency("BTC")
                .cryptoAddress("MOCK_ADDR_" + UUID.randomUUID().toString().substring(0, 8))
                .state(PaymentState.AWAITING_PAYMENT)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .build();

        PaymentInvoice savedInvoice = repository.save(invoice);
        log.info("Invoice saved with ID: {} and Amount: {} BTC", savedInvoice.getId(), amountCrypto);

        paymentStatusProducer.send(PaymentStatusEvent.builder()
                .orderId(savedInvoice.getOrderId())
                .status("AWAITING_PAYMENT")
                .invoiceId(savedInvoice.getId())
                .expiresAt(savedInvoice.getExpiresAt())
                .build());
        sendEvent(savedInvoice.getId(), PaymentEvent.LOCK_RATE);

        redisTemplate.opsForValue().set("invoice:timeout:" + savedInvoice.getId(), "active", Duration.ofMinutes(15));
        sendEvent(savedInvoice.getId(), PaymentEvent.LOCK_RATE);
        return savedInvoice;
    }

    public void expireInvoice(UUID invoiceId) {
        log.info("Expiring invoice: {}", invoiceId);
        sendEvent(invoiceId, PaymentEvent.EXPIRE);
    }

    private void sendEvent(UUID invoiceId, PaymentEvent event) {
        var sm = stateMachineFactory.getStateMachine(invoiceId.toString());
        sm.start();
        Message<PaymentEvent> message = MessageBuilder.withPayload(event)
                .setHeader("INVOICE_ID", invoiceId)
                .build();
        sm.sendEvent(message);
    }

    private void sendInvoiceCreatedEvent(PaymentInvoice invoice) {
        InvoiceCreatedEvent event = new InvoiceCreatedEvent(
                invoice.getOrderId(),
                invoice.getExpiresAt(),
                "AWAITING_PAYMENT"
        );

        kafkaTemplate.send("invoice-events", event);
        log.info("Sent InvoiceCreatedEvent to Kafka for Order: {}", invoice.getOrderId());
    }

}
