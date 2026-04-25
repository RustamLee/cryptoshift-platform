package com.cryptoshift.orchestrator.payment.messaging;

import com.cryptoshift.orchestrator.payment.event.OrderPlacedEvent;
import com.cryptoshift.orchestrator.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventListener {
    private final PaymentService paymentService;

    @KafkaListener(
            topics = "order-placed-topic",
            groupId = "payment-group"
    )
    public void handleOrderPlaced(OrderPlacedEvent event) {
        log.info("RECEIVED EVENT FROM KAFKA: Order ID: {}, Total: {},", event.getOrderId(), event.getTotalPrice());
        paymentService.createInvoice(event.getOrderId(), event.getTotalPrice());
    }
}
