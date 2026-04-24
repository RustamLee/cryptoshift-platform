package com.cryptoshift.orchestrator.config;

import com.cryptoshift.orchestrator.payment.model.PaymentEvent;
import com.cryptoshift.orchestrator.payment.model.PaymentState;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.statemachine.config.EnableStateMachineFactory;
import org.springframework.statemachine.config.EnumStateMachineConfigurerAdapter;
import org.springframework.statemachine.config.builders.StateMachineConfigurationConfigurer;
import org.springframework.statemachine.config.builders.StateMachineStateConfigurer;
import org.springframework.statemachine.config.builders.StateMachineTransitionConfigurer;
import org.springframework.statemachine.listener.StateMachineListenerAdapter;
import org.springframework.statemachine.state.State;

import java.util.EnumSet;

@Slf4j
@Configuration
@EnableStateMachineFactory
public class StateMachineConfig extends EnumStateMachineConfigurerAdapter<PaymentState, PaymentEvent> {
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
        transitions.withExternal().source(PaymentState.NEW).target(PaymentState.EXCHANGE_RATE_LOCKED).event(PaymentEvent.LOCK_RATE)
                .and()
                .withExternal().source(PaymentState.EXCHANGE_RATE_LOCKED).target(PaymentState.AWAITING_PAYMENT).event(PaymentEvent.LOCK_RATE)
                .and()
                .withExternal().source(PaymentState.AWAITING_PAYMENT).target(PaymentState.PAID).event(PaymentEvent.PAYMENT_RECEIVED)
                .and()
                .withExternal().source(PaymentState.AWAITING_PAYMENT).target(PaymentState.EXPIRED).event(PaymentEvent.EXPIRE);
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
}
