package com.example.demo.order.service;

import com.example.demo.order.event.PaymentStatusEvent;
import com.example.demo.order.model.OrderStatus;
import com.example.demo.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentStatusListener {
    private final OrderRepository orderRepository;

    @KafkaListener(
            topics = "payment-status-topic",
            groupId = "bookstore-group",
            properties = {"spring.json.value.default.type=com.example.demo.order.event.PaymentStatusEvent"}
    )
    public void handlePaymentStatus(PaymentStatusEvent event) {
        log.info("Received payment status update from Orchestrator: {}", event);
        try{
            orderRepository.findById(event.getOrderId()).ifPresent(order -> {
                if ("AWAITING_PAYMENT".equals(event.getStatus())) {
                    order.setStatus(OrderStatus.AWAITING_PAYMENT);
                    order.setExpiresAt(event.getExpiresAt());
                    log.info("Order {} status updated to AWAITING_PAYMENT, expires at {}", order.getId(), event.getExpiresAt());
                }
                if ("PAID".equals(event.getStatus())) {
                    order.setStatus(OrderStatus.PAID);
                    log.info("Order {} marked as PAID", order.getId());
                } else if ("EXPIRED".equals(event.getStatus())) {
                    order.setStatus(OrderStatus.CANCELLED);
                    log.info("Order {} marked as CANCELLED", order.getId());
                }
                orderRepository.save(order);
            });
        } catch (Exception e) {
            log.error("Error processing payment status update for order {}: {}", event.getOrderId(), e.getMessage());
        }
    }

}
