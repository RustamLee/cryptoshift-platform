package com.cryptoshift.orchestrator.config;

import com.cryptoshift.orchestrator.payment.dto.PaymentStatusEvent;
import com.cryptoshift.orchestrator.payment.model.PaymentEvent;
import com.cryptoshift.orchestrator.payment.model.PaymentState;
import com.cryptoshift.orchestrator.payment.repository.PaymentRepository;
import com.cryptoshift.orchestrator.payment.service.PaymentStatusProducer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.statemachine.action.Action;
import org.springframework.statemachine.config.EnableStateMachineFactory;
import org.springframework.statemachine.config.EnumStateMachineConfigurerAdapter;
import org.springframework.statemachine.config.builders.StateMachineConfigurationConfigurer;
import org.springframework.statemachine.config.builders.StateMachineStateConfigurer;
import org.springframework.statemachine.config.builders.StateMachineTransitionConfigurer;
import org.springframework.statemachine.listener.StateMachineListenerAdapter;
import org.springframework.statemachine.state.State;

import java.util.EnumSet;
import java.util.UUID;

@Slf4j
@Configuration
@EnableStateMachineFactory
@RequiredArgsConstructor
public class StateMachineConfig extends EnumStateMachineConfigurerAdapter<PaymentState, PaymentEvent> {

    private final PaymentRepository repository;
    private final PaymentStatusProducer producer;

    @Override
    public void configure(StateMachineStateConfigurer<PaymentState, PaymentEvent> states) throws Exception {
        states.withStates()
                .initial(PaymentState.NEW)
                .states(EnumSet.allOf(PaymentState.class))
                .end(PaymentState.PAID)
                .end(PaymentState.EXPIRED)
                .end(PaymentState.CANCELLED);
    }

    @Override
    public void configure(StateMachineTransitionConfigurer<PaymentState, PaymentEvent> transitions) throws Exception {
        transitions
                .withExternal()
                .source(PaymentState.NEW).target(PaymentState.EXCHANGE_RATE_LOCKED)
                .event(PaymentEvent.LOCK_RATE)
                .action(updateStatusAction())

                .and()
                .withExternal()
                .source(PaymentState.EXCHANGE_RATE_LOCKED).target(PaymentState.AWAITING_PAYMENT)
                .event(PaymentEvent.LOCK_RATE)
                .action(updateStatusAction())

                .and()
                .withExternal()
                .source(PaymentState.AWAITING_PAYMENT).target(PaymentState.PAID)
                .event(PaymentEvent.PAYMENT_RECEIVED)
                .action(updateStatusAction())

                .and()
                .withExternal()
                .source(PaymentState.AWAITING_PAYMENT).target(PaymentState.EXPIRED)
                .event(PaymentEvent.EXPIRE)
                .action(updateStatusAction());
    }

    @Override
    public void configure(StateMachineConfigurationConfigurer<PaymentState, PaymentEvent> config) throws Exception {
        StateMachineListenerAdapter<PaymentState, PaymentEvent> adapter = new StateMachineListenerAdapter<>() {
            @Override
            public void stateChanged(State<PaymentState, PaymentEvent> from, State<PaymentState, PaymentEvent> to) {
                String fromState = (from != null) ? from.getId().toString() : "START";
                System.out.println("--- [STATEDIAGRAM] --- Transition from " + fromState + " to " + to.getId());
            }
        };

        config.withConfiguration()
                .autoStartup(false)
                .listener(adapter);
    }

    private Action<PaymentState, PaymentEvent> updateStatusAction(){
        return context -> {
            UUID invoiceId = context.getMessageHeaders().get("INVOICE_ID", UUID.class);
            PaymentState nextState = context.getTarget().getId();
            if (invoiceId != null) {
                repository.findById(invoiceId).ifPresent(invoice -> {
                    invoice.setState(nextState);
                    repository.save(invoice);
                    log.info("Invoice {} updated status to {}", invoiceId, nextState);
                    if(nextState == PaymentState.PAID || nextState == PaymentState.EXPIRED){
                        PaymentStatusEvent statusEvent = PaymentStatusEvent.builder()
                                .orderId(invoice.getOrderId())
                                .status(nextState.name())
                                .invoiceId(invoiceId)
                                .build();
                        producer.send(statusEvent);
                        log.info("Sent feedback to Kafka for Order {}: {}", invoice.getOrderId(), nextState);
                    }
                });
            }
        };
    }

}
