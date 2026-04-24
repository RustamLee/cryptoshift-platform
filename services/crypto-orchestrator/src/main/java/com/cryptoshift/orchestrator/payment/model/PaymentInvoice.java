package com.cryptoshift.orchestrator.payment.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "payment_invoice")
public class PaymentInvoice {

    @Id
    @UuidGenerator
    private UUID id;
    private Long orderId;
    private BigDecimal amountUsd;
    private BigDecimal amountCrypto;
    private String cryptoCurrency;
    private String cryptoAddress;
    @Enumerated(EnumType.STRING)
    private PaymentState state;
}
