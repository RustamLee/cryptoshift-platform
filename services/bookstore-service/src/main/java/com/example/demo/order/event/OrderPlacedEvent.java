package com.example.demo.order.event;

import java.math.BigDecimal;

import com.example.demo.order.model.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderPlacedEvent {
    private Long orderId;
    private BigDecimal totalPrice;
    private String customerEmail;
    private PaymentMethod paymentMethod;
}
