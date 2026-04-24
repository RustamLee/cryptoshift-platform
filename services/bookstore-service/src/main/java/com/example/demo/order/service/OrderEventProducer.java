package com.example.demo.order.service;

import com.example.demo.order.event.OrderPlacedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderEventProducer {

    private final KafkaTemplate<String, OrderPlacedEvent> kafkaTemplate;

    // Название топика (канала), куда шлем сообщение
    private static final String TOPIC = "order-placed-topic";

    public void sendOrderEvent(OrderPlacedEvent event) {
        log.info("Sending order event to Kafka: {}", event);
        kafkaTemplate.send(TOPIC, event);
    }
}