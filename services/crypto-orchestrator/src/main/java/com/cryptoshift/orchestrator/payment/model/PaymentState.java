package com.cryptoshift.orchestrator.payment.model;

public enum PaymentState {
    NEW,
    EXCHANGE_RATE_LOCKED,
    AWAITING_PAYMENT,
    PAID,
    EXPIRED,
    CANCELLED
}
