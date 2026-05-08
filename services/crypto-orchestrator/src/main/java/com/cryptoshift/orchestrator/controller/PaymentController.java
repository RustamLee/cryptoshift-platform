package com.cryptoshift.orchestrator.controller;

import com.cryptoshift.orchestrator.payment.model.PaymentEvent;
import com.cryptoshift.orchestrator.payment.model.PaymentInvoice;
import com.cryptoshift.orchestrator.payment.model.PaymentState;
import com.cryptoshift.orchestrator.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.statemachine.config.StateMachineFactory;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;


@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final StateMachineFactory<PaymentState, PaymentEvent> stateMachineFactory;

    @GetMapping("/{invoiceId}")
    public ResponseEntity<PaymentInvoice> getInvoice(@PathVariable UUID invoiceId) {
        return paymentRepository.findById(invoiceId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/mock-pay/{invoiceId}")
    public ResponseEntity<String> mockConfirmPayment(@PathVariable UUID invoiceId) {
        log.info("MOCK: External payment confirmation received for invoice: {}", invoiceId);
        return paymentRepository.findById(invoiceId)
                .map(invoice -> {
                    if (invoice.getState() != PaymentState.AWAITING_PAYMENT) {
                        return ResponseEntity.badRequest()
                                .body("Cannot pay invoice in status: " + invoice.getState());
                    }
                    sendEvent(invoiceId, PaymentEvent.PAYMENT_RECEIVED);
                    return ResponseEntity.ok("Payment event sent for invoice: " + invoiceId);
                })
                .orElse(ResponseEntity.notFound().build());
    }


    private void sendEvent(UUID invoiceId, PaymentEvent event) {
        var sm = stateMachineFactory.getStateMachine(invoiceId.toString());
        sm.start();

        var message = MessageBuilder.withPayload(event)
                .setHeader("INVOICE_ID", invoiceId)
                .build();

        sm.sendEvent(message);
        log.info("Event {} sent to State Machine for invoice {}", event, invoiceId);
    }

}
