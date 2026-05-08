package com.cryptoshift.orchestrator.payment.service;

import com.cryptoshift.orchestrator.payment.dto.PaymentStatusEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentStatusProducer {
    private final KafkaTemplate<String, PaymentStatusEvent> kafkaTemplate;
    public void send (PaymentStatusEvent event) {
        kafkaTemplate.send("payment-status-topic", event.getOrderId().toString(), event);
    }
}
