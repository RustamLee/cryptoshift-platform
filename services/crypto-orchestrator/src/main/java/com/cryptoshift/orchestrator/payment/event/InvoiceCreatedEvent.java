package com.cryptoshift.orchestrator.payment.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InvoiceCreatedEvent {
    private Long orderId;
    private LocalDateTime expiresAt;
    private String status;

}
