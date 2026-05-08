package com.cryptoshift.orchestrator.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaymentStatusEvent {
    private Long orderId;
    private String status;
    private UUID invoiceId;
    private LocalDateTime expiresAt;
}

