package com.example.demo.order.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentStatusEvent {
    private Long orderId;
    private String status;
    private UUID invoiceId;
    private LocalDateTime expiresAt;
}
