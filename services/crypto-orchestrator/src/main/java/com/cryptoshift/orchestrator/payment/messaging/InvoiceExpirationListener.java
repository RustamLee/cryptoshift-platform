package com.cryptoshift.orchestrator.payment.messaging;

import com.cryptoshift.orchestrator.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class InvoiceExpirationListener implements MessageListener {
    private final PaymentService paymentService;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        String expiredKey = new String(message.getBody());
        if (expiredKey.startsWith("invoice:timeout:")) {
            String uuidStr = expiredKey.replace("invoice:timeout:", "");
            try {
                paymentService.expireInvoice(UUID.fromString(uuidStr));
                log.info("Invoice expired: {}", uuidStr);
            } catch (IllegalArgumentException e) {
                log.error("Invalid UUID format: {}", uuidStr, e);
            }
        }
    }
}
